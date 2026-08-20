import type { DashboardTransactionType } from './actuals'

export type DashboardPlanKind = DashboardTransactionType

/**
 * A planned line in a budget group. `planned` is the raw monthly-scale amount
 * normalized from `numeric`; the period multiplier (×12 in annual mode) is
 * applied later by the shared plan projection, never by the repository.
 */
export type DashboardPlanCategory = {
  id: string
  categoryId: string | null
  name: string
  planned: number
}

export type DashboardPlanGroup = {
  id: string
  name: string
  kind: DashboardPlanKind
  sortOrder: number
  planned: number
  categories: DashboardPlanCategory[]
}

/**
 * The current budget as read by the dashboard. `incomePlanned` and
 * `expensePlanned` are raw sums of the groups' planned amounts (no period
 * multiplier). `kind` derives from `budget_calculation_type`:
 * 'income' → 'income', 'outflow' → 'expense'.
 *
 * Owner: src/repository/dashboard/budget.ts (Fase 3); consumed by the
 * kpis, charts and budget projections.
 */
export type DashboardPlan = {
  id: string
  name: string
  incomePlanned: number
  expensePlanned: number
  groups: DashboardPlanGroup[]
}