import { describe, expect, it } from 'vitest'

import {
  DashboardPeriodSchema,
  dashboardRange,
  parseDashboardPeriod,
} from '@/lib/dashboard/period'

describe('DashboardPeriodSchema contract', () => {
  it.each([
    { mode: 'monthly', year: 2026, month: 0 },
    { mode: 'monthly', year: 2000, month: 0 },
    { mode: 'monthly', year: 2100, month: 11 },
    { mode: 'annual', year: 2000 },
    { mode: 'annual', year: 2100 },
  ])('accepts the valid period %o', period => {
    expect(DashboardPeriodSchema.safeParse(period).success).toBe(true)
  })

  it.each([
    { mode: 'monthly', year: 2026 },
    { mode: 'monthly', year: 2026, month: 12 },
    { mode: 'monthly', year: 2026, month: -1 },
    { mode: 'monthly', year: 2026, month: 1.5 },
    { mode: 'monthly', year: 1999, month: 0 },
    { mode: 'monthly', year: 2101, month: 0 },
    { mode: 'annual', year: 2026, month: 0 },
    { mode: 'annual', year: 2026, userId: 'other-user' },
    { mode: 'annual', year: 2026, timeZone: 'UTC' },
    { mode: 'annual', year: 2026.5 },
    { mode: 'annual' },
    { mode: 'bogus', year: 2026 },
    { mode: 'annual', year: Number.NaN },
  ])('rejects the invalid period %o', period => {
    expect(DashboardPeriodSchema.safeParse(period).success).toBe(false)
  })

  it('rejects string-typed years and months at the boundary', () => {
    expect(DashboardPeriodSchema.safeParse({ mode: 'monthly', year: '2026', month: 0 }).success).toBe(
      false,
    )
    expect(DashboardPeriodSchema.safeParse({ mode: 'monthly', year: 2026, month: '0' }).success).toBe(
      false,
    )
  })

  it('extracts the discriminated union without flattening optional months', () => {
    const monthly = DashboardPeriodSchema.parse({ mode: 'monthly', year: 2026, month: 5 })
    expect(monthly).toEqual({ mode: 'monthly', year: 2026, month: 5 })

    const annual = DashboardPeriodSchema.parse({ mode: 'annual', year: 2026 })
    expect(annual).toEqual({ mode: 'annual', year: 2026 })
  })
})

describe('parseDashboardPeriod strict canonical parser', () => {
  it.each([
    { raw: { mode: 'monthly', year: '2026', month: '0' }, expected: { mode: 'monthly', year: 2026, month: 0 } },
    { raw: { mode: 'monthly', year: '2026', month: '11' }, expected: { mode: 'monthly', year: 2026, month: 11 } },
    { raw: { mode: 'monthly', year: '2000', month: '5' }, expected: { mode: 'monthly', year: 2000, month: 5 } },
    { raw: { mode: 'monthly', year: '2100', month: '9' }, expected: { mode: 'monthly', year: 2100, month: 9 } },
    { raw: { mode: 'annual', year: '2026' }, expected: { mode: 'annual', year: 2026 } },
    { raw: { mode: 'annual', year: '2100' }, expected: { mode: 'annual', year: 2100 } },
  ])('accepts the canonical period $raw', ({ raw, expected }) => {
    expect(parseDashboardPeriod(raw)).toEqual(expected)
  })

  it.each([
    // absent values
    {},
    { mode: 'monthly' },
    { mode: 'monthly', year: '2026' },
    { year: '2026' },
    { mode: 'annual' },
    // malformed values
    { mode: 'monthlyy', year: '2026', month: '0' },
    { mode: 'monthly', year: '20a6', month: '0' },
    { mode: 'monthly', year: '202', month: '0' },
    { mode: 'monthly', year: '20261', month: '0' },
    { mode: 'monthly', year: '2026', month: 'a' },
    { mode: 'annual', year: '2026.' },
    // impossible values
    { mode: 'monthly', year: '1999', month: '0' },
    { mode: 'monthly', year: '2101', month: '0' },
    { mode: 'monthly', year: '2026', month: '12' },
    { mode: 'monthly', year: '2026', month: '-1' },
    { mode: 'annual', year: '1999' },
    { mode: 'annual', year: '2101' },
    // mixed values
    { mode: 'annual', year: '2026', month: '0' },
    { mode: 'monthly', year: '2026', month: ['0'] },
    { mode: 'monthly', year: ['2026'], month: '0' },
    { mode: 'annual', year: '2026', tab: 'overview' },
    { mode: 'monthly', year: '2026', month: '0', extra: 'x' },
    // coerced values (only parseable via Number() coercion)
    { mode: 'monthly', year: '2026.0', month: '0' },
    { mode: 'monthly', year: ' 2026 ', month: '0' },
    { mode: 'monthly', year: '+2026', month: '0' },
    { mode: 'monthly', year: '0x7e2', month: '0' },
    { mode: 'monthly', year: '2e3', month: '0' },
    { mode: 'monthly', year: '', month: '0' },
    { mode: 'monthly', year: '2026', month: '01' },
    { mode: 'monthly', year: '2026', month: '00' },
    { mode: 'monthly', year: '2026', month: '' },
  ])('rejects the non-canonical period %o before any source call', raw => {
    expect(() => parseDashboardPeriod(raw)).toThrow()
  })
})

describe('dashboardRange half-open UTC ranges', () => {
  it('builds the monthly range [monthStart, nextMonthStart)', () => {
    expect(dashboardRange({ mode: 'monthly', year: 2026, month: 1 })).toEqual({
      start: new Date('2026-02-01T00:00:00.000Z'),
      nextStart: new Date('2026-03-01T00:00:00.000Z'),
    })
  })

  it('builds the annual range [yearStart, nextYearStart)', () => {
    expect(dashboardRange({ mode: 'annual', year: 2026 })).toEqual({
      start: new Date('2026-01-01T00:00:00.000Z'),
      nextStart: new Date('2027-01-01T00:00:00.000Z'),
    })
  })

  it('includes the start and excludes the next start at the boundary', () => {
    const range = dashboardRange({ mode: 'monthly', year: 2026, month: 0 })
    const atStart = new Date('2026-01-01T00:00:00.000Z')
    const atNextStart = new Date('2026-02-01T00:00:00.000Z')
    expect(atStart.getTime()).toBeGreaterThanOrEqual(range.start.getTime())
    expect(atStart.getTime()).toBeLessThan(range.nextStart.getTime())
    expect(atNextStart.getTime()).toBeLessThan(range.nextStart.getTime() + 1)
    expect(atNextStart.getTime()).not.toBeLessThan(range.nextStart.getTime())
  })

  it('handles December without rolling over the year', () => {
    expect(dashboardRange({ mode: 'monthly', year: 2026, month: 11 })).toEqual({
      start: new Date('2026-12-01T00:00:00.000Z'),
      nextStart: new Date('2027-01-01T00:00:00.000Z'),
    })
  })
})