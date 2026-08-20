import { describe, expect, it } from 'vitest'

import type { DashboardActual } from '@/lib/dashboard/actuals'
import { projectDashboardBudgetRows } from '@/lib/dashboard/budget'
import { projectDashboardCharts } from '@/lib/dashboard/charts'
import { projectDashboardKpis } from '@/lib/dashboard/kpis'
import type { DashboardPeriod } from '@/lib/dashboard/period'
import type { DashboardPlan } from '@/lib/dashboard/plan'

const monthly: DashboardPeriod = { mode: 'monthly', year: 2026, month: 0 }
const annual: DashboardPeriod = { mode: 'annual', year: 2026 }

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
    {
      id: 'expense-group',
      name: 'Essentials',
      kind: 'expense',
      sortOrder: 1,
      planned: 800,
      categories: [{ id: 'rent-plan', categoryId: 'rent', name: 'Rent', planned: 800 }],
    },
  ],
}

// Mixed activity: in-budget (salary, rent), unplanned categorized (food,
// freelance), uncategorized income and uncategorized expense.
const mixedActuals: DashboardActual[] = [
  { categoryId: 'salary', categoryName: 'Salary', type: 'income', month: 0, total: 1200 },
  { categoryId: 'rent', categoryName: 'Rent', type: 'expense', month: 0, total: 700 },
  { categoryId: 'food', categoryName: 'Food', type: 'expense', month: 0, total: 50 },
  { categoryId: 'freelance', categoryName: 'Freelance', type: 'income', month: 0, total: 300 },
  { categoryId: null, categoryName: null, type: 'income', month: 0, total: 100 },
  { categoryId: null, categoryName: null, type: 'expense', month: 0, total: 25 },
]

describe('projectDashboardKpis', () => {
  it('keeps the mixed-activity formula with uncategorized actuals affecting the KPIs', () => {
    const kpis = projectDashboardKpis(monthly, plan, mixedActuals)

    expect(kpis).toEqual({
      incomePlanned: 1000,
      incomeActual: 1600,
      expensePlanned: 800,
      expenseActual: 775,
      netPlanned: 200,
      netActual: 825,
      available: 275,
    })
  })

  it('annualizes planned amounts by 12 while retaining range actuals', () => {
    const kpis = projectDashboardKpis(annual, plan, mixedActuals)

    expect(kpis).toEqual({
      incomePlanned: 12000,
      incomeActual: 1600,
      expensePlanned: 9600,
      expenseActual: 775,
      netPlanned: 2400,
      netActual: 825,
      available: 2475,
    })
  })

  it('produces only finite values', () => {
    const kpis = projectDashboardKpis(monthly, plan, mixedActuals)
    for (const value of Object.values(kpis)) expect(Number.isFinite(value)).toBe(true)
    expect(JSON.stringify(kpis)).not.toMatch(/NaN|Infinity/)
  })

  it('rejects a non-finite actual total', () => {
    const poisoned: DashboardActual[] = [
      { categoryId: null, categoryName: null, type: 'expense', month: 0, total: Number.NaN },
    ]
    expect(() => projectDashboardKpis(monthly, plan, poisoned)).toThrow()
  })
})

describe('projectDashboardBudgetRows', () => {
  it('orders planned, unplanned categorized, then uncategorized groups', () => {
    const rows = projectDashboardBudgetRows(monthly, plan, mixedActuals)

    expect(rows.groups.map(group => group.id)).toEqual([
      'income-group',
      'expense-group',
      'unplanned-income',
      'unplanned-expense',
      'uncategorized-income',
      'uncategorized-expense',
    ])
  })

  it('keeps distinct unplanned values with unplanned status', () => {
    const rows = projectDashboardBudgetRows(monthly, plan, mixedActuals)

    const unplannedIncome = rows.groups[2]
    expect(unplannedIncome).toMatchObject({ name: 'Unplanned income', planned: 0, actual: 300 })
    expect(unplannedIncome.categories).toEqual([
      expect.objectContaining({ id: 'freelance', name: 'Freelance', planned: 0, actual: 300, status: 'unplanned' }),
    ])

    const unplannedExpense = rows.groups[3]
    expect(unplannedExpense).toMatchObject({ name: 'Unplanned expense', planned: 0, actual: 50 })
    expect(unplannedExpense.categories).toEqual([
      expect.objectContaining({ id: 'food', name: 'Food', planned: 0, actual: 50, status: 'unplanned' }),
    ])
  })

  it('places uncategorized groups last as final context', () => {
    const rows = projectDashboardBudgetRows(monthly, plan, mixedActuals)

    const uncategorizedIncome = rows.groups[4]
    const uncategorizedExpense = rows.groups[5]
    expect(uncategorizedIncome).toMatchObject({ name: 'Uncategorized', kind: 'income', actual: 100 })
    expect(uncategorizedExpense).toMatchObject({ name: 'Uncategorized', kind: 'expense', actual: 25 })
    expect(uncategorizedIncome.categories[0]).toMatchObject({
      id: 'uncategorized-income',
      name: 'Uncategorized',
      status: 'unplanned',
    })
  })

  it('computes per-row diff, pct and status thresholds for planned categories', () => {
    const rows = projectDashboardBudgetRows(monthly, plan, mixedActuals)

    expect(rows.groups[0].categories[0]).toMatchObject({
      id: 'salary',
      planned: 1000,
      actual: 1200,
      diff: 200,
      pct: 1.2,
      status: 'good',
    })
    expect(rows.groups[1].categories[0]).toMatchObject({
      id: 'rent',
      planned: 800,
      actual: 700,
      diff: 100,
      pct: 0.875,
      status: 'warning',
    })
  })

  it('retains planned categories without activity and keeps archived display names', () => {
    const archivedPlan: DashboardPlan = {
      ...plan,
      groups: [
        {
          id: 'expense-group',
          name: 'Essentials',
          kind: 'expense',
          sortOrder: 0,
          planned: 100,
          categories: [
            { id: 'food-plan', categoryId: 'food', name: 'Food (archived display)', planned: 100 },
          ],
        },
      ],
    }
    const rows = projectDashboardBudgetRows(monthly, archivedPlan, [])

    expect(rows.groups).toHaveLength(1)
    expect(rows.groups[0].categories[0]).toMatchObject({
      id: 'food',
      name: 'Food (archived display)',
      planned: 100,
      actual: 0,
      status: 'good',
    })
  })

  it('produces only finite values and rejects non-finite output', () => {
    const rows = projectDashboardBudgetRows(monthly, plan, mixedActuals)
    const numbers: number[] = []
    for (const group of rows.groups) {
      numbers.push(group.planned, group.actual)
      for (const category of group.categories) numbers.push(category.planned, category.actual, category.diff, category.pct)
    }
    for (const value of numbers) expect(Number.isFinite(value)).toBe(true)

    const poisoned: DashboardActual[] = [
      { categoryId: 'food', categoryName: 'Food', type: 'expense', month: 0, total: Number.POSITIVE_INFINITY },
    ]
    expect(() => projectDashboardBudgetRows(monthly, plan, poisoned)).toThrow()
  })
})

describe('projectDashboardCharts', () => {
  it('emits monthly planned-versus-actual with an empty trend', () => {
    const charts = projectDashboardCharts(monthly, plan, mixedActuals)

    expect(charts.budgetVsActual).toEqual([
      { label: 'Income', estimado: 1000, real: 1600 },
      { label: 'Expenses', estimado: 800, real: 775 },
    ])
    expect(charts.monthlyTrend).toEqual([])
  })

  it('sums expense-by-group to expenseActual including unplanned and uncategorized', () => {
    const charts = projectDashboardCharts(monthly, plan, mixedActuals)

    expect(charts.expenseByGroup).toEqual([
      { name: 'Essentials', value: 700 },
      { name: 'Unplanned expense', value: 50 },
      { name: 'Uncategorized', value: 25 },
    ])
    expect(charts.expenseByGroup.reduce((sum, point) => sum + point.value, 0)).toBe(775)
  })

  it('emits exactly twelve chronological annual points with zero-filled months', () => {
    const sparseActuals: DashboardActual[] = [
      { categoryId: 'salary', categoryName: 'Salary', type: 'income', month: 0, total: 1200 },
      { categoryId: 'rent', categoryName: 'Rent', type: 'expense', month: 5, total: 700 },
    ]
    const charts = projectDashboardCharts(annual, plan, sparseActuals)

    expect(charts.monthlyTrend).toHaveLength(12)
    expect(charts.monthlyTrend[0]).toEqual({ label: 'Jan', ingreso: 1200, gasto: 0 })
    expect(charts.monthlyTrend[5]).toEqual({ label: 'Jun', ingreso: 0, gasto: 700 })
    const zeroPoints = charts.monthlyTrend.filter(point => point.ingreso === 0 && point.gasto === 0)
    expect(zeroPoints).toHaveLength(10)
    expect(charts.monthlyTrend.map(point => point.label)).toEqual([
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ])
  })

  it('produces only finite values and rejects non-finite output', () => {
    const charts = projectDashboardCharts(monthly, plan, mixedActuals)
    for (const point of [...charts.budgetVsActual, ...charts.monthlyTrend, ...charts.expenseByGroup]) {
      for (const [key, value] of Object.entries(point)) {
        if (key === 'label' || key === 'name') continue
        expect(Number.isFinite(value)).toBe(true)
      }
    }
    expect(JSON.stringify(charts)).not.toMatch(/NaN|Infinity/)

    const poisoned: DashboardActual[] = [
      { categoryId: 'food', categoryName: 'Food', type: 'expense', month: 0, total: Number.NaN },
    ]
    expect(() => projectDashboardCharts(monthly, plan, poisoned)).toThrow()
  })
})