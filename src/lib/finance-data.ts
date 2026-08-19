import { z } from 'zod'
import { DashboardPeriodSchema } from './schema'

export type DashboardPeriod = z.infer<typeof DashboardPeriodSchema>
export type ViewMode = DashboardPeriod['mode']
export type SupportedAccountType = 'savings' | 'checking' | 'investment' | 'credit' | 'cash'
export type TransactionType = 'income' | 'expense'

export type Kpis = {
  incomePlanned: number
  incomeActual: number
  expensePlanned: number
  expenseActual: number
  netPlanned: number
  netActual: number
  available: number
}

export type CategoryRow = {
  id: string
  name: string
  kind: TransactionType
  planned: number
  actual: number
  diff: number
  pct: number
  status: 'good' | 'warning' | 'over' | 'unplanned'
}

export type GroupRow = {
  id: string
  name: string
  kind: TransactionType
  planned: number
  actual: number
  categories: CategoryRow[]
}

export type DashboardAccount = {
  id: string
  name: string
  type: SupportedAccountType | null
  presentation: 'typed' | 'generic'
  currency: string
  balance: number
}

export type DashboardSnapshot = {
  budget: {
    id: string
    name: string
    groups: Array<{
      id: string
      name: string
      calculationType: 'income' | 'outflow'
      sortOrder: number
      items: Array<{
        id: string
        categoryId: string | null
        name: string
        plannedAmount: string | number | null
      }>
    }>
  } | null
  categories: Array<{ id: string; name: string; type: TransactionType }>
  transactions: Array<{
    id: string
    categoryId: string | null
    type: TransactionType
    amount: string | number | null
    date: Date
  }>
  accounts: Array<{
    id: string
    name: string
    type: string
    currency: string
    balance: string | number | null
  }>
}

export type DashboardViewModel = {
  period: DashboardPeriod
  kpis: Kpis
  groups: GroupRow[]
  budgetVsActual: Array<{ label: string; estimado: number; real: number }>
  monthlyTrend: Array<{ label: string; ingreso: number; gasto: number }>
  expenseByGroup: Array<{ name: string; value: number }>
  accounts: DashboardAccount[]
  aggregateBalance: { currency: string; balance: number } | null
  empty: { hasBudget: boolean; hasTransactions: boolean; hasAccounts: boolean; isEmpty: boolean }
}

const supportedAccountTypes = new Set<SupportedAccountType>([
  'savings',
  'checking',
  'investment',
  'credit',
  'cash',
])

function finiteNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function categoryStatus(
  kind: TransactionType,
  planned: number,
  actual: number,
): CategoryRow['status'] {
  if (planned <= 0) return actual !== 0 ? 'unplanned' : 'good'
  const ratio = actual / planned
  if (kind === 'expense') return ratio < 0.8 ? 'good' : ratio <= 1 ? 'warning' : 'over'
  return ratio >= 1 ? 'good' : ratio >= 0.8 ? 'warning' : 'over'
}

function toCategoryRow(
  id: string,
  name: string,
  kind: TransactionType,
  planned: number,
  actual: number,
): CategoryRow {
  const normalizedPlan = finiteNumber(planned)
  const normalizedActual = finiteNumber(actual)
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

export function formatCurrency(value: number, options?: { sign?: boolean }): string {
  const amount = finiteNumber(value)
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Math.abs(amount),
  )
  if (options?.sign && amount !== 0) return `${amount > 0 ? '+' : '-'}${formatted}`
  return amount < 0 ? `-${formatted}` : formatted
}

function mapAccounts(
  accounts: DashboardSnapshot['accounts'],
): Pick<DashboardViewModel, 'accounts' | 'aggregateBalance'> {
  const mapped = accounts.map(account => {
    const type = supportedAccountTypes.has(account.type as SupportedAccountType)
      ? (account.type as SupportedAccountType)
      : null
    return {
      id: account.id,
      name: account.name,
      type,
      presentation: type ? ('typed' as const) : ('generic' as const),
      currency: account.currency,
      balance: finiteNumber(account.balance),
    }
  })
  const currencies = new Set(mapped.map(account => account.currency))
  return {
    accounts: mapped,
    aggregateBalance:
      mapped.length > 0 && currencies.size === 1
        ? {
            currency: mapped[0].currency,
            balance: mapped.reduce((total, account) => total + account.balance, 0),
          }
        : null,
  }
}

export function buildDashboardViewModel(
  snapshot: DashboardSnapshot,
  period: DashboardPeriod,
  start: Date,
  nextStart: Date,
): DashboardViewModel {
  const multiplier = period.mode === 'annual' ? 12 : 1
  const transactions = snapshot.transactions.filter(
    transaction => transaction.date >= start && transaction.date < nextStart,
  )
  const actuals = new Map<string, number>()
  const uncategorized = new Map<TransactionType, number>()
  const categoryById = new Map(snapshot.categories.map(category => [category.id, category]))

  for (const transaction of transactions) {
    const amount = finiteNumber(transaction.amount)
    if (transaction.categoryId) {
      actuals.set(
        transaction.categoryId,
        finiteNumber(actuals.get(transaction.categoryId)) + amount,
      )
    } else {
      uncategorized.set(
        transaction.type,
        finiteNumber(uncategorized.get(transaction.type)) + amount,
      )
    }
  }

  const plannedCategoryIds = new Set<string>()
  const groups: GroupRow[] = (snapshot.budget?.groups ?? [])
    .toSorted((left, right) => left.sortOrder - right.sortOrder)
    .map(group => {
      const kind: TransactionType = group.calculationType === 'income' ? 'income' : 'expense'
      const categories = group.items.map(item => {
        if (item.categoryId) plannedCategoryIds.add(item.categoryId)
        const category = item.categoryId ? categoryById.get(item.categoryId) : undefined
        return toCategoryRow(
          item.categoryId ?? item.id,
          category?.name ?? item.name,
          kind,
          finiteNumber(item.plannedAmount) * multiplier,
          item.categoryId ? finiteNumber(actuals.get(item.categoryId)) : 0,
        )
      })
      return {
        id: group.id,
        name: group.name,
        kind,
        planned: categories.reduce((total, category) => total + category.planned, 0),
        actual: categories.reduce((total, category) => total + category.actual, 0),
        categories,
      }
    })

  const unplannedByType = new Map<TransactionType, CategoryRow[]>()
  for (const [categoryId, actual] of actuals) {
    if (plannedCategoryIds.has(categoryId)) continue
    const category = categoryById.get(categoryId)
    const kind =
      category?.type ??
      transactions.find(transaction => transaction.categoryId === categoryId)?.type
    if (!kind) continue
    const rows = unplannedByType.get(kind) ?? []
    rows.push(toCategoryRow(categoryId, category?.name ?? 'Uncategorized', kind, 0, actual))
    unplannedByType.set(kind, rows)
  }
  for (const kind of ['income', 'expense'] as const) {
    const categories = [...(unplannedByType.get(kind) ?? [])]
    const uncategorizedActual = finiteNumber(uncategorized.get(kind))
    if (categories.length > 0) {
      groups.push({
        id: `unplanned-${kind}`,
        name: `Unplanned ${kind}`,
        kind,
        planned: 0,
        actual: categories.reduce((total, category) => total + category.actual, 0),
        categories,
      })
    }
    if (uncategorizedActual !== 0) {
      const category = toCategoryRow(
        `uncategorized-${kind}`,
        'Uncategorized',
        kind,
        0,
        uncategorizedActual,
      )
      groups.push({
        id: `uncategorized-${kind}`,
        name: 'Uncategorized',
        kind,
        planned: 0,
        actual: uncategorizedActual,
        categories: [category],
      })
    }
  }

  const incomeGroups = groups.filter(group => group.kind === 'income')
  const expenseGroups = groups.filter(group => group.kind === 'expense')
  const incomePlanned = incomeGroups.reduce((total, group) => total + group.planned, 0)
  const incomeActual = incomeGroups.reduce((total, group) => total + group.actual, 0)
  const expensePlanned = expenseGroups.reduce((total, group) => total + group.planned, 0)
  const expenseActual = expenseGroups.reduce((total, group) => total + group.actual, 0)
  const kpis = {
    incomePlanned,
    incomeActual,
    expensePlanned,
    expenseActual,
    netPlanned: incomePlanned - expensePlanned,
    netActual: incomeActual - expenseActual,
    available: incomePlanned - expensePlanned,
  }
  const trend = Array.from({ length: period.mode === 'annual' ? 12 : 1 }, (_, index) => {
    const month = period.mode === 'annual' ? index : period.month
    const monthStart = new Date(Date.UTC(period.year, month, 1))
    const monthNextStart = new Date(Date.UTC(period.year, month + 1, 1))
    const monthTransactions = transactions.filter(
      transaction => transaction.date >= monthStart && transaction.date < monthNextStart,
    )
    return {
      label: monthStart.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
      ingreso: monthTransactions
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + finiteNumber(transaction.amount), 0),
      gasto: monthTransactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + finiteNumber(transaction.amount), 0),
    }
  })
  const accounts = mapAccounts(snapshot.accounts)

  return {
    period,
    kpis,
    groups,
    budgetVsActual: [
      { label: 'Income', estimado: incomePlanned, real: incomeActual },
      { label: 'Expenses', estimado: expensePlanned, real: expenseActual },
    ],
    monthlyTrend: trend,
    expenseByGroup: expenseGroups
      .filter(group => group.actual !== 0)
      .map(group => ({ name: group.name, value: group.actual })),
    ...accounts,
    empty: {
      hasBudget: snapshot.budget !== null,
      hasTransactions: transactions.length > 0,
      hasAccounts: snapshot.accounts.length > 0,
      isEmpty:
        snapshot.budget === null && transactions.length === 0 && snapshot.accounts.length === 0,
    },
  }
}

const PERIOD_KEYS = new Set(['mode', 'year', 'month'])

function currentMonthlyPeriod(now: Date): DashboardPeriod {
  return { mode: 'monthly', year: now.getUTCFullYear(), month: now.getUTCMonth() }
}

function isYear(value: string): boolean {
  return /^(?:20(?:0\d|[1-9]\d)|2100)$/.test(value)
}

function isMonth(value: string): boolean {
  return /^(?:[0-9]|1[01])$/.test(value)
}

export function parseDashboardPeriod(
  raw: Record<string, string | string[] | undefined>,
  now = new Date(),
): DashboardPeriod {
  if (Object.keys(raw).some(key => !PERIOD_KEYS.has(key))) return currentMonthlyPeriod(now)

  const { mode, year, month } = raw
  if (typeof mode !== 'string' || typeof year !== 'string' || Array.isArray(month))
    return currentMonthlyPeriod(now)
  if (!isYear(year)) return currentMonthlyPeriod(now)

  if (mode === 'annual' && month === undefined) return { mode, year: Number(year) }
  if (mode === 'monthly' && typeof month === 'string' && isMonth(month)) {
    return { mode, year: Number(year), month: Number(month) }
  }

  return currentMonthlyPeriod(now)
}
