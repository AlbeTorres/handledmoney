import { z } from 'zod'

/**
 * Monthly reporting period. Requires an integer `month` in the range 0–11
 * (JavaScript convention) and an integer `year` in 2000–2100. Unknown keys
 * are rejected.
 *
 * Owner: dashboard page / period parser (src/lib/dashboard/period.ts).
 */
const monthlyPeriodSchema = z
  .object({
    mode: z.literal('monthly'),
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(0).max(11),
  })
  .strict()

/**
 * Annual reporting period. Forbids `month`; only `year` is meaningful.
 */
const annualPeriodSchema = z
  .object({
    mode: z.literal('annual'),
    year: z.number().int().min(2000).max(2100),
  })
  .strict()

/**
 * Runtime contract for a dashboard reporting period. The discriminated union
 * guarantees monthly periods carry a `month` and annual periods never do.
 * `.strict()` rejects unknown keys and out-of-range years.
 */
export const DashboardPeriodSchema = z.discriminatedUnion('mode', [
  monthlyPeriodSchema,
  annualPeriodSchema,
])

export type DashboardPeriod = z.infer<typeof DashboardPeriodSchema>

/**
 * Half-open UTC range: `start` is included, `nextStart` is excluded.
 * Only period.ts builds ranges (`dashboardRange`).
 */
export type DashboardRange = {
  start: Date
  nextStart: Date
}

/**
 * Raw search-parameter shape the page hands to the strict parser. Every value
 * is a string (or an array when the client repeated the parameter); nothing
 * is coerced to a number here.
 */
export type DashboardPeriodInput = Record<string, string | string[] | undefined>

const PERIOD_KEYS = new Set(['mode', 'year', 'month'])
const YEAR_PATTERN = /^(?:20\d\d|2100)$/
const MONTH_PATTERN = /^(?:[0-9]|1[01])$/

/**
 * Strict canonical parser for the dashboard reporting period. Accepts exactly
 * `mode` (`'monthly'` | `'annual'`), a canonical four-digit `year` string in
 * 2000–2100, and — for monthly only — a canonical `month` string 0–11 without
 * leading zeros.
 *
 * Rejects absent, malformed, impossible, mixed, and coerced values before any
 * dashboard data source is consulted: unknown keys, missing members, out-of-
 * range or non-canonical strings (e.g. `' 2026 '`, `'2026.0'`, `'0x7e2'`,
 * `'01'`), arrays, and annual periods that carry a `month`.
 */
export function parseDashboardPeriod(raw: DashboardPeriodInput): DashboardPeriod {
  if (Object.keys(raw).some(key => !PERIOD_KEYS.has(key))) {
    throw new Error('Invalid dashboard period: unexpected search parameter')
  }

  const { mode, year, month } = raw
  if (mode !== 'monthly' && mode !== 'annual') {
    throw new Error('Invalid dashboard period: mode must be "monthly" or "annual"')
  }
  if (typeof year !== 'string' || !YEAR_PATTERN.test(year)) {
    throw new Error('Invalid dashboard period: year must be a canonical 2000–2100 value')
  }

  if (mode === 'annual') {
    if (month !== undefined) {
      throw new Error('Invalid dashboard period: annual periods must not carry a month')
    }
    return { mode, year: Number(year) }
  }

  if (typeof month !== 'string' || !MONTH_PATTERN.test(month)) {
    throw new Error('Invalid dashboard period: monthly periods require a canonical month 0–11')
  }
  return { mode, year: Number(year), month: Number(month) }
}

/**
 * One UTC half-open range for a validated period: monthly
 * `[monthStart, nextMonthStart)` or annual `[yearStart, nextYearStart)`.
 * Every period-sensitive source shares this range, so URL and date drift are
 * impossible.
 */
export function dashboardRange(period: DashboardPeriod): DashboardRange {
  if (period.mode === 'monthly') {
    return {
      start: new Date(Date.UTC(period.year, period.month, 1)),
      nextStart: new Date(Date.UTC(period.year, period.month + 1, 1)),
    }
  }
  return {
    start: new Date(Date.UTC(period.year, 0, 1)),
    nextStart: new Date(Date.UTC(period.year + 1, 0, 1)),
  }
}