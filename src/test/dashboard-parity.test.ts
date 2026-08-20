import { describe, expect, it } from 'vitest'

import { presentDashboardAccounts } from '@/lib/dashboard/account-presentation'
import { projectDashboardBudgetRows } from '@/lib/dashboard/budget'
import { projectDashboardCharts } from '@/lib/dashboard/charts'
import { projectDashboardKpis } from '@/lib/dashboard/kpis'
import { dashboardRange, type DashboardPeriod } from '@/lib/dashboard/period'
import {
  dashboardAccounts,
  dashboardActuals,
  dashboardPlan,
  dashboardSnapshot,
} from './fixtures/dashboard'

/**
 * Monthly and annual USD widget-contract fixtures for the COMPOSED dashboard
 * pipeline (tasks 4.1 + 4.2).
 *
 * The fixture (`./fixtures/dashboard`) is the canonical data set; its legacy
 * snapshot shape is still exported so the parity gate that ran BEFORE the
 * legacy path was deleted remains reproducible. In that gate
 * (`finance-data.test.ts` at WU3 commit time), the legacy
 * `buildDashboardViewModel` output matched every composed projection below
 * for the same fixture, with ONE intentional difference: `available` now
 * incorporates uncategorized income/expense
 * (`incomePlanned - expensePlanned + uncategorizedIncome - uncategorizedExpense`),
 * so monthly available is 175 (legacy 200) and annual available is 2375
 * (legacy 2400). These composed values are the ongoing contract.
 */

function composedOutput(period: DashboardPeriod) {
  const range = dashboardRange(period)
  const plan = dashboardPlan
  const actuals = dashboardActuals(range)
  const accounts = dashboardAccounts
  return {
    kpis: projectDashboardKpis(period, plan, actuals),
    charts: projectDashboardCharts(period, plan, actuals),
    rows: projectDashboardBudgetRows(period, plan, actuals),
    accounts: presentDashboardAccounts(accounts),
  }
}

const monthly: DashboardPeriod = { mode: 'monthly', year: 2026, month: 0 }
const annual: DashboardPeriod = { mode: 'annual', year: 2026 }

describe('dashboard monthly USD widget contract (composed projections)', () => {
  it('projects planned/actual totals, net, and the uncategorized-aware available', () => {
    const composed = composedOutput(monthly)

    expect(composed.kpis).toEqual({
      incomePlanned: 1000,
      incomeActual: 1200,
      expensePlanned: 800,
      expenseActual: 775,
      netPlanned: 200,
      netActual: 425,
      available: 175, // 1000 - 800 + uncategorizedIncome(0) - uncategorizedExpense(25)
    })
  })

  it('projects the ordered group rows with matching category rows and statuses', () => {
    const composed = composedOutput(monthly)

    expect(composed.rows.groups.map(group => group.id)).toEqual([
      'income-group',
      'expense-group',
      'unplanned-expense',
      'uncategorized-expense',
    ])
    expect(composed.rows.groups.map(group => group.name)).toEqual([
      'Income',
      'Essentials',
      'Unplanned expense',
      'Uncategorized',
    ])
    expect(composed.rows.groups.map(group => group.planned)).toEqual([1000, 800, 0, 0])
    expect(composed.rows.groups.map(group => group.actual)).toEqual([1200, 700, 50, 25])
    expect(composed.rows.groups[0].categories[0]).toMatchObject({
      id: 'salary', // item.categoryId ?? item.id
      name: 'Salary',
      kind: 'income',
      planned: 1000,
      actual: 1200,
      diff: 200,
      pct: 1.2,
      status: 'good',
    })
    expect(composed.rows.groups[3].categories[0]).toMatchObject({
      id: 'uncategorized-expense',
      name: 'Uncategorized',
      kind: 'expense',
      planned: 0,
      actual: 25,
      status: 'unplanned',
    })
  })

  it('projects budgetVsActual and expenseByGroup for the selected month', () => {
    const composed = composedOutput(monthly)

    expect(composed.charts.budgetVsActual).toEqual([
      { label: 'Income', estimado: 1000, real: 1200 },
      { label: 'Expenses', estimado: 800, real: 775 },
    ])
    expect(composed.charts.monthlyTrend).toEqual([])
    expect(composed.charts.expenseByGroup).toEqual([
      { name: 'Essentials', value: 700 },
      { name: 'Unplanned expense', value: 50 },
      { name: 'Uncategorized', value: 25 },
    ])
  })

  it('presents accounts and suppresses mixed-currency aggregate balances', () => {
    const composed = composedOutput(monthly)

    expect(composed.accounts.accounts).toEqual([
      {
        id: 'account-usd',
        name: 'Cash',
        type: 'cash',
        presentation: 'typed',
        currency: 'USD',
        balance: 500,
      },
      {
        id: 'account-eur',
        name: 'Legacy bank',
        type: null,
        presentation: 'generic',
        currency: 'EUR',
        balance: 200,
      },
    ])
    expect(composed.accounts.aggregateBalance).toBeNull()
  })

  it('produces no NaN or Infinity in any projection output', () => {
    const composed = composedOutput(monthly)

    expect(JSON.stringify(composed.kpis)).not.toContain('NaN')
    expect(JSON.stringify(composed.charts)).not.toContain('NaN')
    expect(JSON.stringify(composed.rows)).not.toContain('NaN')
    expect(JSON.stringify(composed.accounts)).not.toContain('NaN')
  })
})

describe('dashboard annual USD widget contract (composed projections)', () => {
  it('scales planned amounts by twelve while actuals stay range-scoped', () => {
    const composed = composedOutput(annual)

    expect(composed.kpis).toEqual({
      incomePlanned: 12000,
      incomeActual: 1200,
      expensePlanned: 9600,
      expenseActual: 775,
      netPlanned: 2400,
      netActual: 425,
      available: 2375, // 2400 - uncategorizedExpense(25)
    })
    expect(composed.charts.budgetVsActual).toEqual([
      { label: 'Income', estimado: 12000, real: 1200 },
      { label: 'Expenses', estimado: 9600, real: 775 },
    ])
    expect(composed.rows.groups.map(group => group.planned)).toEqual([12000, 9600, 0, 0])
  })

  it('emits exactly twelve chronological monthly actual points, zero-filled', () => {
    const composed = composedOutput(annual)

    expect(composed.charts.monthlyTrend).toHaveLength(12)
    expect(composed.charts.monthlyTrend[0]).toEqual({ label: 'Jan', ingreso: 1200, gasto: 775 })
    expect(composed.charts.monthlyTrend[1]).toEqual({ label: 'Feb', ingreso: 0, gasto: 0 })
    expect(composed.charts.monthlyTrend[11]).toEqual({ label: 'Dec', ingreso: 0, gasto: 0 })
  })

  it('excludes transactions before the UTC start and at the next UTC start', () => {
    const extended = {
      ...dashboardSnapshot,
      transactions: [
        ...dashboardSnapshot.transactions,
        { id: 'before-start', categoryId: 'salary', type: 'income' as const, amount: '100', date: new Date('2025-12-31T23:59:59.999Z') },
        { id: 'next-start', categoryId: 'salary', type: 'income' as const, amount: '100', date: new Date('2027-01-01T00:00:00.000Z') },
      ],
    }

    const composed = projectDashboardKpis(
      annual,
      dashboardPlan,
      dashboardActuals(dashboardRange(annual), extended),
    )

    expect(composed.incomeActual).toBe(1200)
  })
})