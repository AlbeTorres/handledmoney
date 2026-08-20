import type { DashboardActual, DashboardTransactionType } from './actuals'
import type { DashboardPeriod } from './period'
import type { DashboardPlan } from './plan'

export type CategoryStatus = 'good' | 'warning' | 'over' | 'unplanned'

/**
 * A category row of the budget table. Derived values:
 *
 *   diff = actual - planned  for income,  planned - actual  for expense
 *   pct  = actual / planned  (0 when planned is 0; never NaN)
 *   status thresholds: planned ≤ 0 → 'unplanned' when actual ≠ 0 else 'good';
 *     expense: ratio < 0.8 'good', ≤ 1 'warning', > 1 'over';
 *     income:  ratio ≥ 1 'good', ≥ 0.8 'warning', < 0.8 'over'.
 */
export type CategoryRow = {
  id: string
  name: string
  kind: DashboardTransactionType
  planned: number
  actual: number
  diff: number
  pct: number
  status: CategoryStatus
}

/**
 * A group of category rows. `planned`/`actual` are the group sums.
 */
export type GroupRow = {
  id: string
  name: string
  kind: DashboardTransactionType
  planned: number
  actual: number
  categories: CategoryRow[]
}

/**
 * Budget table rows for the selected period. Ordering invariant: planned
 * groups by `sortOrder`, then unplanned categorized income, then unplanned
 * categorized expense, then uncategorized groups.
 *
 * Owner: src/lib/dashboard/budget.ts projection.
 */
export type DashboardBudgetRows = {
  groups: GroupRow[]
}

function requireFinite(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Dashboard budget projection received a non-finite ${label}`)
  }
  return value
}

function categoryStatus(
  kind: DashboardTransactionType,
  planned: number,
  actual: number,
): CategoryStatus {
  if (planned <= 0) return actual !== 0 ? 'unplanned' : 'good'
  const ratio = actual / planned
  if (kind === 'expense') return ratio < 0.8 ? 'good' : ratio <= 1 ? 'warning' : 'over'
  return ratio >= 1 ? 'good' : ratio >= 0.8 ? 'warning' : 'over'
}

function toCategoryRow(
  id: string,
  name: string,
  kind: DashboardTransactionType,
  planned: number,
  actual: number,
): CategoryRow {
  const normalizedPlan = requireFinite(planned, `planned amount for ${name}`)
  const normalizedActual = requireFinite(actual, `actual amount for ${name}`)
  return {
    id,
    name,
    kind,
    planned: normalizedPlan,
    actual: normalizedActual,
    diff: kind === 'income' ? normalizedActual - normalizedPlan : normalizedPlan - normalizedActual,
    pct: normalizedPlan > 0 ? normalizedActual / normalizedPlan : 0,
    status: categoryStatus(kind, normalizedPlan, normalizedActual),
  }
}

/**
 * Pure group builder shared by the budget rows and charts projections. Orders
 * planned groups by `sortOrder`, then unplanned categorized income, then
 * unplanned categorized expense, then uncategorized groups. The plan arrives
 * in raw monthly scale; annual mode multiplies planned amounts by 12.
 */
export function buildDashboardGroups(
  period: DashboardPeriod,
  plan: DashboardPlan | null,
  actuals: DashboardActual[],
): GroupRow[] {
  const multiplier = period.mode === 'annual' ? 12 : 1

  const actualByCategory = new Map<
    string,
    { total: number; type: DashboardTransactionType; name: string }
  >()
  const uncategorizedByType = new Map<DashboardTransactionType, number>()
  for (const actual of actuals) {
    const total = requireFinite(
      actual.total,
      `actual total for ${actual.categoryId ?? 'uncategorized'}`,
    )
    if (actual.categoryId == null) {
      uncategorizedByType.set(actual.type, (uncategorizedByType.get(actual.type) ?? 0) + total)
    } else {
      const current = actualByCategory.get(actual.categoryId)
      actualByCategory.set(actual.categoryId, {
        total: (current?.total ?? 0) + total,
        type: actual.type,
        name: actual.categoryName ?? current?.name ?? 'Uncategorized',
      })
    }
  }

  const plannedCategoryIds = new Set<string>()
  const groups: GroupRow[] = (plan?.groups ?? [])
    .toSorted((left, right) => left.sortOrder - right.sortOrder)
    .map(group => {
      const categories = group.categories.map(item => {
        const planned = requireFinite(item.planned, `planned amount for ${item.name}`) * multiplier
        const actual = item.categoryId ? (actualByCategory.get(item.categoryId)?.total ?? 0) : 0
        if (item.categoryId) plannedCategoryIds.add(item.categoryId)
        return toCategoryRow(item.categoryId ?? item.id, item.name, group.kind, planned, actual)
      })
      return {
        id: group.id,
        name: group.name,
        kind: group.kind,
        planned: categories.reduce((sum, category) => sum + category.planned, 0),
        actual: categories.reduce((sum, category) => sum + category.actual, 0),
        categories,
      }
    })

  const unplannedByType = new Map<DashboardTransactionType, CategoryRow[]>()
  for (const [categoryId, { total, type, name }] of actualByCategory) {
    if (plannedCategoryIds.has(categoryId)) continue
    const rows = unplannedByType.get(type) ?? []
    rows.push(toCategoryRow(categoryId, name, type, 0, total))
    unplannedByType.set(type, rows)
  }

  for (const kind of ['income', 'expense'] as const) {
    const unplanned = unplannedByType.get(kind) ?? []
    if (unplanned.length > 0) {
      groups.push({
        id: `unplanned-${kind}`,
        name: `Unplanned ${kind}`,
        kind,
        planned: 0,
        actual: unplanned.reduce((sum, category) => sum + category.actual, 0),
        categories: unplanned,
      })
    }
  }

  for (const kind of ['income', 'expense'] as const) {
    const uncategorizedTotal = uncategorizedByType.get(kind) ?? 0
    if (uncategorizedTotal !== 0) {
      const category = toCategoryRow(
        `uncategorized-${kind}`,
        'Uncategorized',
        kind,
        0,
        uncategorizedTotal,
      )
      groups.push({
        id: `uncategorized-${kind}`,
        name: 'Uncategorized',
        kind,
        planned: 0,
        actual: uncategorizedTotal,
        categories: [category],
      })
    }
  }

  return groups
}

function assertFiniteGroups(groups: GroupRow[]): void {
  for (const group of groups) {
    requireFinite(group.planned, `group planned ${group.id}`)
    requireFinite(group.actual, `group actual ${group.id}`)
    for (const category of group.categories) {
      requireFinite(category.planned, `category planned ${category.id}`)
      requireFinite(category.actual, `category actual ${category.id}`)
      requireFinite(category.diff, `category diff ${category.id}`)
      requireFinite(category.pct, `category pct ${category.id}`)
    }
  }
}

/**
 * Pure budget rows projection. Returns the ordered planned/unplanned/
 * uncategorized groups and rejects non-finite output.
 */
export function projectDashboardBudgetRows(
  period: DashboardPeriod,
  plan: DashboardPlan | null,
  actuals: DashboardActual[],
): DashboardBudgetRows {
  const groups = buildDashboardGroups(period, plan, actuals)
  assertFiniteGroups(groups)
  return { groups }
}