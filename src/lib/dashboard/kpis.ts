/**
 * KPI summary for the selected period. In annual mode planned amounts are
 * multiplied by 12. Formulas:
 *
 *   incomePlanned  = Σ planned income
 *   incomeActual   = Σ income actuals in range (uncategorized included)
 *   expensePlanned = Σ planned expense
 *   expenseActual  = Σ expense actuals in range (uncategorized included)
 *   netPlanned     = incomePlanned - expensePlanned
 *   netActual      = incomeActual - expenseActual
 *   available      = incomePlanned - expensePlanned
 *                    + uncategorizedIncome - uncategorizedExpense
 *
 * Example: planned income 1000, planned expense 800, uncategorized income 100
 * and uncategorized expense 25 → available = 275. Uncategorized transactions
 * always affect the KPIs and the unassigned amount.
 *
 * Invariants: `incomePlanned` equals the sum of the income budget rows,
 * `expensePlanned` equals the sum of the expense budget rows, and the
 * `budgetVsActual` planned values use the same totals.
 *
 * Owner: src/lib/dashboard/kpis.ts projection.
 */
export type DashboardKpis = {
  incomePlanned: number
  incomeActual: number
  expensePlanned: number
  expenseActual: number
  netPlanned: number
  netActual: number
  available: number
}

import type { DashboardActual } from '../../interfaces/actuals'
import { DashboardPeriod } from '../schema'

import type { DashboardPlan } from './plan'

function requireFinite(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Dashboard KPI projection received a non-finite ${label}`)
  }
  return value
}

/**
 * Pure KPI projection over the shared plan and actuals contracts. The plan
 * arrives in raw monthly scale; annual mode multiplies planned amounts by 12
 * while actuals stay range-scoped. Uncategorized income and expense always
 * affect `incomeActual`, `expenseActual`, and `available`.
 */
export function projectDashboardKpis(
  period: DashboardPeriod,
  plan: DashboardPlan | null,
  actuals: DashboardActual[],
): DashboardKpis {
  const multiplier = period.mode === 'annual' ? 12 : 1

  let incomePlanned = 0
  let expensePlanned = 0
  for (const group of plan?.groups ?? []) {
    const planned =
      group.categories.reduce(
        (sum, item) => sum + requireFinite(item.planned, `planned amount for ${item.name}`),
        0,
      ) * multiplier
    if (group.kind === 'income') incomePlanned += planned
    else expensePlanned += planned
  }

  let incomeActual = 0
  let expenseActual = 0
  let uncategorizedIncome = 0
  let uncategorizedExpense = 0
  for (const actual of actuals) {
    const total = requireFinite(
      actual.total,
      `actual total for ${actual.categoryId ?? 'uncategorized'}`,
    )
    if (actual.type === 'income') incomeActual += total
    else expenseActual += total
    if (actual.categoryId == null) {
      if (actual.type === 'income') uncategorizedIncome += total
      else uncategorizedExpense += total
    }
  }

  const kpis: DashboardKpis = {
    incomePlanned,
    incomeActual,
    expensePlanned,
    expenseActual,
    netPlanned: incomePlanned - expensePlanned,
    netActual: incomeActual - expenseActual,
    available: incomePlanned - expensePlanned + uncategorizedIncome - uncategorizedExpense,
  }
  for (const value of Object.values(kpis)) requireFinite(value, 'KPI output')
  return kpis
}
