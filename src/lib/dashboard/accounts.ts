export type SupportedAccountType = 'savings' | 'checking' | 'investment' | 'credit' | 'cash'

/**
 * Raw account row for the dashboard. `type` is the raw DB string; the
 * presentation projection validates it against `SupportedAccountType`.
 * `balance` is a finite number normalized from the DB `numeric`.
 *
 * Owner: src/repository/dashboard/accounts.ts (Fase 3).
 */
export type DashboardAccount = {
  id: string
  name: string
  type: string
  currency: string
  balance: number
}

/**
 * Net worth across accounts. Only meaningful when every account shares one
 * currency; consumers receive `null` for mixed-currency or empty sets. No
 * currency conversion is ever performed (USD-only MVP).
 */
export type AggregateBalance = {
  currency: string
  balance: number
}