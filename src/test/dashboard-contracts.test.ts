import { describe, expect, it } from 'vitest'

import type { AggregateBalance, DashboardAccount } from '@/interfaces/accounts'
import type { DashboardActual } from '@/interfaces/actuals'
import type { DashboardBudgetRows } from '@/lib/dashboard/budget'
import type { DashboardCharts } from '@/lib/dashboard/charts'
import type { DashboardKpis } from '@/lib/dashboard/kpis'
import type { DashboardPeriod, DashboardRange } from '@/lib/dashboard/period'
import type { DashboardPlan } from '@/lib/dashboard/plan'

describe('dashboard contract shapes', () => {
  it('pins the half-open DashboardRange shape', () => {
    const range: DashboardRange = {
      start: new Date('2026-01-01T00:00:00.000Z'),
      nextStart: new Date('2026-02-01T00:00:00.000Z'),
    }
    expect(range).toEqual({
      start: new Date('2026-01-01T00:00:00.000Z'),
      nextStart: new Date('2026-02-01T00:00:00.000Z'),
    })
  })

  it('pins the aggregated actuals contract', () => {
    const actual: DashboardActual = {
      categoryId: 'salary',
      categoryName: 'Salary',
      type: 'income',
      month: 0,
      total: 1200,
    }
    expect(actual).toEqual({
      categoryId: 'salary',
      categoryName: 'Salary',
      type: 'income',
      month: 0,
      total: 1200,
    })
  })

  it('pins uncategorized actuals with a null category', () => {
    const actual: DashboardActual = {
      categoryId: null,
      categoryName: null,
      type: 'expense',
      month: 0,
      total: 25,
    }
    expect(actual.categoryId).toBeNull()
    expect(actual.categoryName).toBeNull()
    expect(actual.type).toBe('expense')
  })

  it('pins the plan contract with raw (non-annualized) totals', () => {
    const plan: DashboardPlan = {
      id: 'budget-1',
      name: 'Household budget',
      incomePlanned: 1000,
      expensePlanned: 800,
      groups: [
        {
          id: 'income-group',
          name: 'Income',
          kind: 'income',
          sortOrder: 0,
          planned: 1000,
          categories: [{ id: 'salary-plan', categoryId: 'salary', name: 'Salary', planned: 1000 }],
        },
      ],
    }
    expect(plan.incomePlanned).toBe(1000)
    expect(plan.groups[0].categories[0]).toMatchObject({ planned: 1000 })
  })

  it('pins the account and aggregate contracts', () => {
    const account: DashboardAccount = {
      id: 'account-usd',
      name: 'Cash',
      type: 'cash',
      currency: 'USD',
      balance: 500,
    }
    const aggregate: AggregateBalance = { currency: 'USD', balance: 500 }
    expect(account).toEqual({
      id: 'account-usd',
      name: 'Cash',
      type: 'cash',
      currency: 'USD',
      balance: 500,
    })
    expect(aggregate).toEqual({ currency: 'USD', balance: 500 })
  })

  it('pins the KPI contract and the confirmed available formula result', () => {
    const kpis: DashboardKpis = {
      incomePlanned: 1000,
      incomeActual: 950,
      expensePlanned: 800,
      expenseActual: 725,
      netPlanned: 200,
      netActual: 225,
      available: 275,
    }
    expect(kpis).toEqual({
      incomePlanned: 1000,
      incomeActual: 950,
      expensePlanned: 800,
      expenseActual: 725,
      netPlanned: 200,
      netActual: 225,
      available: 275,
    })
  })

  it('pins the charts contract points', () => {
    const charts: DashboardCharts = {
      budgetVsActual: [
        { label: 'Income', estimado: 1000, real: 950 },
        { label: 'Expenses', estimado: 800, real: 725 },
      ],
      monthlyTrend: [
        { label: 'Jan', ingreso: 0, gasto: 0 },
        { label: 'Feb', ingreso: 0, gasto: 0 },
      ],
      expenseByGroup: [{ name: 'Essentials', value: 700 }],
    }
    expect(charts.budgetVsActual).toHaveLength(2)
    expect(charts.monthlyTrend[0]).toEqual({ label: 'Jan', ingreso: 0, gasto: 0 })
    expect(charts.expenseByGroup[0]).toEqual({ name: 'Essentials', value: 700 })
  })

  it('pins the budget rows contract and status semantics', () => {
    const rows: DashboardBudgetRows = {
      groups: [
        {
          id: 'income-group',
          name: 'Income',
          kind: 'income',
          planned: 1000,
          actual: 1200,
          categories: [
            {
              id: 'salary-plan',
              name: 'Salary',
              kind: 'income',
              planned: 1000,
              actual: 1200,
              diff: 200,
              pct: 1.2,
              status: 'good',
            },
          ],
        },
      ],
    }
    expect(rows.groups[0].categories[0].status).toBe('good')
    expect(rows.groups[0].categories[0].diff).toBe(200)
  })
})

describe('DashboardPeriod discriminated union (compile-time)', () => {
  it('forces a month on monthly periods', () => {
    // @ts-expect-error: monthly requires an explicit month
    const invalid: DashboardPeriod = { mode: 'monthly', year: 2026 }
    void invalid
  })

  it('forbids a month on annual periods', () => {
    // @ts-expect-error: annual forbids month
    const invalid: DashboardPeriod = { mode: 'annual', year: 2026, month: 0 }
    void invalid
  })
})
