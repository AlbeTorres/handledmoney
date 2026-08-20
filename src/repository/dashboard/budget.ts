import { db } from '@/db'
import { currentBudgetsTable } from '@/db/schema'
import type {
  DashboardPlan,
  DashboardPlanCategory,
  DashboardPlanGroup,
} from '@/lib/dashboard/plan'
import { eq } from 'drizzle-orm'

function normalizeFinite(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * One owner-scoped query for the authenticated user's current budget:
 * current selection → budget → groups (ordered by `sortOrder`) → items with
 * their category display context. Archived categories are retained because
 * the category relation applies no archived_at filter, keeping historical
 * display context available. Returns `null` as the explicit empty state when
 * the owner has no current selection or the selected budget is not owned.
 *
 * Planned amounts are raw monthly-scale finite numbers; the period multiplier
 * (×12 in annual mode) is applied later by the shared plan projection, never
 * here.
 */
export async function getDashboardPlan(userId: string): Promise<DashboardPlan | null> {
  const selection = await db.query.currentBudgetsTable.findFirst({
    where: eq(currentBudgetsTable.userId, userId),
    with: {
      budget: {
        with: {
          groups: {
            orderBy: (groups, { asc }) => [asc(groups.sortOrder)],
            with: {
              items: { with: { category: true } },
            },
          },
        },
      },
    },
  })

  const budget = selection?.budget
  // Defense-in-depth ownership check: the selected budget must belong to the
  // caller. Drizzle relational queries scope the top-level row by the caller,
  // and the budget is reachable only through that row, but the explicit check
  // keeps the null contract honest even if data integrity is ever violated.
  if (!budget || budget.userId !== userId) return null

  // Groups are ordered by sortOrder in SQL; re-sorting here keeps the
  // contract explicit regardless of driver behavior.
  const groups: DashboardPlanGroup[] = budget.groups
    .toSorted((left, right) => left.sortOrder - right.sortOrder)
    .map(group => {
    const kind = group.calculationType === 'income' ? 'income' : 'expense'
    const categories: DashboardPlanCategory[] = group.items.map(item => ({
      id: item.id,
      categoryId: item.categoryId,
      name: item.category?.name ?? item.name,
      planned: normalizeFinite(item.plannedAmount),
    }))
    return {
      id: group.id,
      name: group.name,
      kind,
      sortOrder: group.sortOrder,
      planned: categories.reduce((sum, category) => sum + category.planned, 0),
      categories,
    }
  })

  return {
    id: budget.id,
    name: budget.name,
    incomePlanned: groups
      .filter(group => group.kind === 'income')
      .reduce((sum, group) => sum + group.planned, 0),
    expensePlanned: groups
      .filter(group => group.kind === 'expense')
      .reduce((sum, group) => sum + group.planned, 0),
    groups,
  }
}
