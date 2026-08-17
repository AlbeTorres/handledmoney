import { describe, expect, it } from 'vitest'

import {
  DashboardPeriodSchema,
  buildDashboardViewModel,
  utcRange,
} from '@/lib/finance-data'
import { dashboardSnapshot } from './fixtures/dashboard'

describe('dashboard finance data', () => {
  it('validates only strict monthly and annual reporting periods', () => {
    expect(DashboardPeriodSchema.safeParse({ mode: 'monthly', year: 2026, month: 0 }).success).toBe(true)
    expect(DashboardPeriodSchema.safeParse({ mode: 'monthly', year: 2026 }).success).toBe(false)
    expect(DashboardPeriodSchema.safeParse({ mode: 'monthly', year: 2026, month: 12 }).success).toBe(false)
    expect(DashboardPeriodSchema.safeParse({ mode: 'annual', year: 2026, month: 0 }).success).toBe(false)
    expect(DashboardPeriodSchema.safeParse({ mode: 'annual', year: 2026, userId: 'other-user' }).success).toBe(false)
    expect(DashboardPeriodSchema.safeParse({ mode: 'annual', year: 2026, timeZone: 'UTC' }).success).toBe(false)
  })

  it('uses UTC half-open ranges for monthly and annual reporting', () => {
    expect(utcRange({ mode: 'monthly', year: 2026, month: 1 })).toEqual({
      start: new Date('2026-02-01T00:00:00.000Z'),
      nextStart: new Date('2026-03-01T00:00:00.000Z'),
    })
    expect(utcRange({ mode: 'annual', year: 2026 })).toEqual({
      start: new Date('2026-01-01T00:00:00.000Z'),
      nextStart: new Date('2027-01-01T00:00:00.000Z'),
    })
  })

  it('maps annual plans as twelve monthly plans while retaining period actuals', () => {
    const data = buildDashboardViewModel(dashboardSnapshot, { mode: 'annual', year: 2026 })

    expect(data.kpis).toEqual({
      incomePlanned: 12000,
      incomeActual: 1200,
      expensePlanned: 9600,
      expenseActual: 775,
      netPlanned: 2400,
      netActual: 425,
      available: 2400,
    })
    expect(data.groups[0].categories[0]).toMatchObject({ planned: 12000, actual: 1200, diff: -10800, status: 'over', pct: 0.1 })
    expect(data.groups[1].categories[0]).toMatchObject({ planned: 9600, actual: 700, diff: 8900, status: 'good' })
  })

  it('excludes actuals before the UTC start and at the next UTC start', () => {
    const data = buildDashboardViewModel({
      ...dashboardSnapshot,
      transactions: [
        ...dashboardSnapshot.transactions,
        { id: 'before-start', categoryId: 'salary', type: 'income' as const, amount: '100', date: new Date('2025-12-31T23:59:59.999Z') },
        { id: 'next-start', categoryId: 'salary', type: 'income' as const, amount: '100', date: new Date('2027-01-01T00:00:00.000Z') },
      ],
    }, { mode: 'annual', year: 2026 })

    expect(data.kpis.incomeActual).toBe(1200)
  })

  it('keeps planned-only, unplanned categorized, and uncategorized activity visible in order', () => {
    const data = buildDashboardViewModel({
      ...dashboardSnapshot,
      transactions: dashboardSnapshot.transactions.filter(transaction => transaction.id !== 'rent-actual'),
    }, { mode: 'monthly', year: 2026, month: 0 })

    expect(data.groups.flatMap(group => group.categories).map(category => category.id)).toEqual([
      'salary', 'rent', 'food', 'uncategorized-expense',
    ])
    expect(data.groups[1].categories[0]).toMatchObject({ actual: 0, planned: 800, status: 'good' })
    expect(data.groups[2].categories[0]).toMatchObject({ planned: 0, actual: 50, status: 'unplanned', kind: 'expense' })
    expect(data.groups[3].categories[0]).toMatchObject({ name: 'Uncategorized', planned: 0, actual: 25, status: 'unplanned' })
  })

  it('uses status thresholds and finite fallbacks without producing NaN', () => {
    const data = buildDashboardViewModel({
      ...dashboardSnapshot,
      budget: {
        ...dashboardSnapshot.budget,
        groups: [{
          id: 'expense-group', name: 'Essentials', calculationType: 'outflow' as const, sortOrder: 0,
          items: [{ id: 'food-plan', categoryId: 'food', name: 'Food', plannedAmount: '100' }],
        }],
      },
      transactions: [
        { id: 'warning', categoryId: 'food', type: 'expense' as const, amount: '80', date: new Date('2026-01-01T00:00:00.000Z') },
        { id: 'bad-number', categoryId: null, type: 'income' as const, amount: 'Infinity', date: new Date('2026-01-02T00:00:00.000Z') },
      ],
    }, { mode: 'monthly', year: 2026, month: 0 })

    expect(data.groups[0].categories[0]).toMatchObject({ status: 'warning', pct: 0.8, diff: 20 })
    expect(data.kpis.incomeActual).toBe(0)
    expect(JSON.stringify(data)).not.toContain('NaN')
    expect(JSON.stringify(data)).not.toContain('Infinity')
  })

  it('preserves supported account literals, presents legacy types generically, and suppresses mixed totals', () => {
    const data = buildDashboardViewModel(dashboardSnapshot, { mode: 'monthly', year: 2026, month: 0 })

    expect(data.accounts).toEqual([
      expect.objectContaining({ id: 'account-usd', type: 'cash', presentation: 'typed', balance: 500 }),
      expect.objectContaining({ id: 'account-eur', type: null, presentation: 'generic', balance: 200 }),
    ])
    expect(data.aggregateBalance).toBeNull()

    const oneCurrency = buildDashboardViewModel({ ...dashboardSnapshot, accounts: [dashboardSnapshot.accounts[0]] }, { mode: 'monthly', year: 2026, month: 0 })
    expect(oneCurrency.aggregateBalance).toEqual({ currency: 'USD', balance: 500 })
  })
})
