/**
 * USD formatter for the read-only dashboard widgets. Tolerant by design:
 * non-finite input falls back to 0 so a malformed stored amount can never
 * crash a widget render. `sign` prefixes the absolute amount with `+`/`-`
 * (skipped for zero).
 *
 * Owner: dashboard widgets (kpi-cards, budget-table, finance-charts,
 * insight-card). Replaces the legacy `formatCurrency` from
 * `src/lib/finance-data.ts`.
 */
export function formatCurrency(value: number, options?: { sign?: boolean }): string {
  const amount = Number.isFinite(value) ? value : 0
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Math.abs(amount),
  )
  if (options?.sign && amount !== 0) return `${amount > 0 ? '+' : '-'}${formatted}`
  return amount < 0 ? `-${formatted}` : formatted
}