import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findSelection: vi.fn(),
  findBudget: vi.fn(),
  findCategories: vi.fn(),
  findAccounts: vi.fn(),
  findTransactions: vi.fn(),
  predicates: [] as Array<{ operator: string; value?: unknown }>,
}))

vi.mock('@/db', () => ({
  db: {
    query: {
      currentBudgetsTable: { findFirst: mocks.findSelection },
      budgetsTable: { findFirst: mocks.findBudget },
      categoriesTable: { findMany: mocks.findCategories },
      bankAccountsTable: { findMany: mocks.findAccounts },
      transactionsTable: { findMany: mocks.findTransactions },
    },
  },
}))

vi.mock('drizzle-orm', async importOriginal => ({
  ...await importOriginal<typeof import('drizzle-orm')>(),
  and: (...conditions: unknown[]) => ({ operator: 'and', conditions }),
  eq: (column: unknown, value: unknown) => { mocks.predicates.push({ operator: 'eq', value }); return { operator: 'eq', column, value } },
  gte: (column: unknown, value: unknown) => { mocks.predicates.push({ operator: 'gte', value }); return { operator: 'gte', column, value } },
  lt: (column: unknown, value: unknown) => { mocks.predicates.push({ operator: 'lt', value }); return { operator: 'lt', column, value } },
  isNull: (column: unknown) => { mocks.predicates.push({ operator: 'isNull' }); return { operator: 'isNull', column } },
}))

import { getDashboardSnapshot } from '@/repository/dashboard'

describe('getDashboardSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.predicates.length = 0
    mocks.findSelection.mockResolvedValue({ userId: 'user-1', budgetId: 'budget-1' })
    mocks.findBudget.mockResolvedValue({ id: 'budget-1', name: 'Budget', groups: [] })
    mocks.findCategories.mockResolvedValue([])
    mocks.findAccounts.mockResolvedValue([])
    mocks.findTransactions.mockResolvedValue([])
  })

  it('uses bounded owner-scoped reads with UTC half-open transaction filters and no row queries', async () => {
    await expect(getDashboardSnapshot('user-1', { mode: 'monthly', year: 2026, month: 1 })).resolves.toMatchObject({
      budget: { id: 'budget-1' }, categories: [], accounts: [], transactions: [],
    })

    expect(mocks.findSelection).toHaveBeenCalledOnce()
    expect(mocks.findBudget).toHaveBeenCalledOnce()
    expect(mocks.findCategories).toHaveBeenCalledOnce()
    expect(mocks.findAccounts).toHaveBeenCalledOnce()
    expect(mocks.findTransactions).toHaveBeenCalledOnce()
    expect(mocks.predicates.filter(predicate => predicate.operator === 'eq' && predicate.value === 'user-1')).toHaveLength(5)
    expect(mocks.predicates).toEqual(expect.arrayContaining([
      { operator: 'gte', value: new Date('2026-02-01T00:00:00.000Z') },
      { operator: 'lt', value: new Date('2026-03-01T00:00:00.000Z') },
      { operator: 'isNull' },
    ]))
  })

  it('does not query a budget when the owner has no current selection', async () => {
    mocks.findSelection.mockResolvedValue(undefined)

    await expect(getDashboardSnapshot('user-1', { mode: 'annual', year: 2026 })).resolves.toMatchObject({ budget: null })

    expect(mocks.findBudget).not.toHaveBeenCalled()
    expect(mocks.findCategories).toHaveBeenCalledOnce()
    expect(mocks.findAccounts).toHaveBeenCalledOnce()
    expect(mocks.findTransactions).toHaveBeenCalledOnce()
  })
})
