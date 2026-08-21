/**
 * Sign of a transaction and of a budget group. Mirrors the `category_type`
 * PostgreSQL enum, which only allows these two values.
 */
export type DashboardTransactionType = 'income' | 'expense'

/**
 * One aggregated row per (category, type, month) from the dashboard's
 * aggregated transactions query. Rows are grouped in SQL — individual
 * transactions are never fetched.
 *
 * `categoryId: null` marks uncategorized activity, which still feeds KPIs,
 * the expense donut and the unassigned amount (it is never omitted).
 * `month` uses the 0–11 JavaScript convention. `total` is a finite number
 * normalized from the DB `numeric` sum; NaN/Infinity are contract violations.
 *
 * Owner: src/repository/dashboard/actuals.ts (Fase 3).
 */
export type DashboardActual = {
  categoryId: string | null
  categoryName: string | null
  type: DashboardTransactionType
  month: number
  total: number
}