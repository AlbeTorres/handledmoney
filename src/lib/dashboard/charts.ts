/**
 * Bar chart point used in monthly mode ("Estimado vs Real"). `label` is a
 * short fixed label; `estimado` is the planned amount and `real` the actual
 * amount for the same period.
 */
export type BudgetActualPoint = {
  label: string
  estimado: number
  real: number
}

/**
 * Trend point used in annual mode. `ingreso`/`gasto` are the income/expense
 * actuals for one month of the year.
 */
export type MonthlyTrendPoint = {
  label: string
  ingreso: number
  gasto: number
}

/**
 * One slice of the expense donut. `value` is the expense actual for a group.
 */
export type ExpenseGroupPoint = {
  name: string
  value: number
}

/**
 * Chart data for the selected period. Invariants:
 *
 * - `budgetVsActual` has exactly two points (Income, Expenses) and is used
 *   in monthly mode.
 * - `monthlyTrend` has exactly 12 points (Jan–Dec) in annual mode and is
 *   empty in monthly mode (monthly renders `budgetVsActual` instead).
 * - `expenseByGroup` includes planned groups with activity, unplanned
 *   categorized expense and the "Uncategorized" pseudo-group; its total
 *   equals `expenseActual`.
 * - No point value is ever NaN or Infinity.
 *
 * Owner: src/lib/dashboard/charts.ts projection.
 */
export type DashboardCharts = {
  budgetVsActual: BudgetActualPoint[]
  monthlyTrend: MonthlyTrendPoint[]
  expenseByGroup: ExpenseGroupPoint[]
}

import type { DashboardActual } from '../../interfaces/actuals'
import { DashboardPeriod } from '../schema'
import { buildDashboardGroups } from './budget'

import type { DashboardPlan } from './plan'

function requireFinite(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Dashboard chart projection received a non-finite ${label}`)
  }
  return value
}

/**
 * Pure chart projection over the shared plan and actuals contracts. Monthly
 * output presents planned-versus-actual; annual output emits exactly twelve
 * chronological Jan–Dec actual points, zero-filled for months without
 * activity. The expense donut sums to `expenseActual`. Rejects non-finite
 * output.
 */
export function projectDashboardCharts(
  period: DashboardPeriod,
  plan: DashboardPlan | null,
  actuals: DashboardActual[],
): DashboardCharts {
  const groups = buildDashboardGroups(period, plan, actuals)

  const incomeGroups = groups.filter(group => group.kind === 'income')
  const expenseGroups = groups.filter(group => group.kind === 'expense')
  const incomePlanned = incomeGroups.reduce((sum, group) => sum + group.planned, 0)
  const incomeActual = incomeGroups.reduce((sum, group) => sum + group.actual, 0)
  const expensePlanned = expenseGroups.reduce((sum, group) => sum + group.planned, 0)
  const expenseActual = expenseGroups.reduce((sum, group) => sum + group.actual, 0)

  const monthlyTrend: MonthlyTrendPoint[] =
    period.mode === 'annual'
      ? Array.from({ length: 12 }, (_, month) => {
          const income = actuals
            .filter(actual => actual.type === 'income' && actual.month === month)
            .reduce(
              (sum, actual) => sum + requireFinite(actual.total, `actual total for month ${month}`),
              0,
            )
          const expense = actuals
            .filter(actual => actual.type === 'expense' && actual.month === month)
            .reduce(
              (sum, actual) => sum + requireFinite(actual.total, `actual total for month ${month}`),
              0,
            )
          return {
            label: new Date(Date.UTC(period.year, month, 1)).toLocaleString('en-US', {
              month: 'short',
              timeZone: 'UTC',
            }),
            ingreso: income,
            gasto: expense,
          }
        })
      : []

  const budgetVsActual: BudgetActualPoint[] = [
    { label: 'Income', estimado: incomePlanned, real: incomeActual },
    { label: 'Expenses', estimado: expensePlanned, real: expenseActual },
  ]

  const expenseByGroup: ExpenseGroupPoint[] = expenseGroups
    .filter(group => group.actual !== 0)
    .map(group => ({ name: group.name, value: group.actual }))

  const charts: DashboardCharts = { budgetVsActual, monthlyTrend, expenseByGroup }
  for (const point of budgetVsActual) {
    requireFinite(point.estimado, 'budgetVsActual estimado')
    requireFinite(point.real, 'budgetVsActual real')
  }
  for (const point of monthlyTrend) {
    requireFinite(point.ingreso, 'monthlyTrend ingreso')
    requireFinite(point.gasto, 'monthlyTrend gasto')
  }
  for (const point of expenseByGroup) requireFinite(point.value, 'expenseByGroup value')
  return charts
}
