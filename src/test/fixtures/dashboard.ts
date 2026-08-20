import type { DashboardAccount } from '@/lib/dashboard/accounts'
import type { DashboardActual } from '@/lib/dashboard/actuals'
import type { DashboardRange } from '@/lib/dashboard/period'
import type { DashboardPlan } from '@/lib/dashboard/plan'

/**
 * Canonical dashboard fixture in the LEGACY snapshot shape. Task 4.1's parity
 * tests feed this snapshot to the legacy `buildDashboardViewModel` AND derive
 * the composed-pipeline inputs (`dashboardPlan`, `dashboardActuals`,
 * `dashboardAccounts`) from the very same data, proving old and new widget
 * outputs agree before the legacy path is removed.
 */
export const dashboardSnapshot = {
  budget: {
    id: 'budget-1',
    name: 'Household budget',
    groups: [
      {
        id: 'income-group',
        name: 'Income',
        calculationType: 'income' as const,
        sortOrder: 0,
        items: [{ id: 'salary-plan', categoryId: 'salary', name: 'Salary', plannedAmount: '1000' }],
      },
      {
        id: 'expense-group',
        name: 'Essentials',
        calculationType: 'outflow' as const,
        sortOrder: 1,
        items: [{ id: 'rent-plan', categoryId: 'rent', name: 'Rent', plannedAmount: '800' }],
      },
    ],
  },
  categories: [
    { id: 'salary', name: 'Salary', type: 'income' as const },
    { id: 'rent', name: 'Rent', type: 'expense' as const },
    { id: 'food', name: 'Food', type: 'expense' as const },
  ],
  transactions: [
    { id: 'salary-actual', categoryId: 'salary', type: 'income' as const, amount: '1200', date: new Date('2026-01-10T00:00:00.000Z') },
    { id: 'rent-actual', categoryId: 'rent', type: 'expense' as const, amount: '700', date: new Date('2026-01-12T00:00:00.000Z') },
    { id: 'food-actual', categoryId: 'food', type: 'expense' as const, amount: '50', date: new Date('2026-01-20T00:00:00.000Z') },
    { id: 'uncategorized-actual', categoryId: null, type: 'expense' as const, amount: '25', date: new Date('2026-01-21T00:00:00.000Z') },
  ],
  accounts: [
    { id: 'account-usd', name: 'Cash', type: 'cash', currency: 'USD', balance: '500' },
    { id: 'account-eur', name: 'Legacy bank', type: 'bank', currency: 'EUR', balance: '200' },
  ],
}

/**
 * The same fixture as the composed `DashboardPlan` contract: raw monthly-scale
 * planned amounts (no annual multiplier — projections apply it).
 */
export const dashboardPlan: DashboardPlan = (() => {
  const groups = dashboardSnapshot.budget.groups.map(group => {
    const categories = group.items.map(item => ({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      planned: Number(item.plannedAmount),
    }))
    return {
      id: group.id,
      name: group.name,
      kind: (group.calculationType === 'income' ? 'income' : 'expense') as 'income' | 'expense',
      sortOrder: group.sortOrder,
      planned: categories.reduce((sum, category) => sum + category.planned, 0),
      categories,
    }
  })
  return {
    id: dashboardSnapshot.budget.id,
    name: dashboardSnapshot.budget.name,
    incomePlanned: groups
      .filter(group => group.kind === 'income')
      .reduce((sum, group) => sum + group.planned, 0),
    expensePlanned: groups
      .filter(group => group.kind === 'expense')
      .reduce((sum, group) => sum + group.planned, 0),
    groups,
  }
})()

/**
 * The same fixture as composed `DashboardActual` rows: transactions within the
 * half-open UTC range aggregated by (category, type, month), mirroring the
 * SQL aggregate in `src/repository/dashboard/actuals.ts`. An optional snapshot
 * override lets tests extend the canonical fixture (e.g. boundary rows).
 */
export function dashboardActuals(
  range: DashboardRange,
  snapshot: typeof dashboardSnapshot = dashboardSnapshot,
): DashboardActual[] {
  const categoryName = new Map(snapshot.categories.map(category => [category.id, category.name]))
  const rows = new Map<string, DashboardActual & { key: string }>()
  for (const transaction of snapshot.transactions) {
    if (transaction.date < range.start || transaction.date >= range.nextStart) continue
    const amount = Number(transaction.amount)
    const total = Number.isFinite(amount) ? amount : 0
    const key = `${transaction.categoryId ?? 'null'}|${transaction.type}|${transaction.date.getUTCMonth()}`
    const existing = rows.get(key)
    if (existing) {
      existing.total += total
    } else {
      rows.set(key, {
        key,
        categoryId: transaction.categoryId,
        categoryName: transaction.categoryId
          ? (categoryName.get(transaction.categoryId) ?? null)
          : null,
        type: transaction.type,
        month: transaction.date.getUTCMonth(),
        total,
      })
    }
  }
  return [...rows.values()].map(({ key: _key, ...row }) => row)
}

/**
 * The same fixture as composed raw `DashboardAccount` rows (finite balances).
 */
export const dashboardAccounts: DashboardAccount[] = dashboardSnapshot.accounts.map(account => ({
  id: account.id,
  name: account.name,
  type: account.type,
  currency: account.currency,
  balance: Number(account.balance),
}))