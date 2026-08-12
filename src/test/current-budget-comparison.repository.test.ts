import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ currentSelection: vi.fn(), findBudget: vi.fn(), findTransactions: vi.fn() }))

vi.mock('@/db', () => ({
  db: {
    query: {
      currentBudgetsTable: { findFirst: mocks.currentSelection },
      budgetsTable: { findFirst: mocks.findBudget },
      transactionsTable: { findMany: mocks.findTransactions },
    },
  },
}))

import { getCurrentBudgetComparison } from '@/repository/budget'

const selectedBudget = {
  id: 'budget-current', userId: 'user-1', name: 'Current plan', startDate: new Date('2026-02-01'), endDate: null, createdAt: new Date(), updatedAt: new Date(),
  groups: [{
    id: 'group-1', budgetId: 'budget-current', name: 'Bills', calculationType: 'outflow' as const, sortOrder: 0, createdAt: new Date(), updatedAt: new Date(),
    items: [{ id: 'item-1', budgetId: 'budget-current', groupId: 'group-1', categoryId: 'rent', name: 'Rent', plannedAmount: '1000', createdAt: new Date(), updatedAt: new Date(), category: { id: 'rent', name: 'Rent' } }],
  }, {
    id: 'group-2', budgetId: 'budget-current', name: 'Income', calculationType: 'income' as const, sortOrder: 1, createdAt: new Date(), updatedAt: new Date(),
    items: [{ id: 'item-2', budgetId: 'budget-current', groupId: 'group-2', categoryId: 'salary', name: 'Salary', plannedAmount: '2000', createdAt: new Date(), updatedAt: new Date(), category: { id: 'salary', name: 'Salary' } }],
  }],
}

describe('getCurrentBudgetComparison', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.currentSelection.mockResolvedValue({ userId: 'user-1', budgetId: 'budget-current' })
    mocks.findBudget.mockResolvedValue(selectedBudget)
  })

  it('uses the manually selected budget and aggregates all owned categorized transactions without date selection', async () => {
    mocks.findTransactions.mockResolvedValue([
      { categoryId: 'rent', amount: '800', type: 'expense', category: { name: 'Rent' }, date: new Date('2000-01-01') },
      { categoryId: 'groceries', amount: '125', type: 'expense', category: { name: 'Groceries' }, date: new Date('2099-01-01') },
      { categoryId: 'salary', amount: '1950', type: 'income', category: { name: 'Salary' }, date: new Date('1999-01-01') },
    ])

    const result = await getCurrentBudgetComparison('user-1')

    expect(result?.budget.id).toBe('budget-current')
    expect(result?.categories).toEqual(expect.arrayContaining([expect.objectContaining({ categoryId: 'rent', plannedAmount: 1000, actualAmount: 800, variance: 200 })]))
    expect(result?.actualWithoutPlan).toEqual([expect.objectContaining({ categoryId: 'groceries', plannedAmount: 0, actualAmount: 125 })])
    expect(result?.income).toEqual({ plannedAmount: 2000, actualAmount: 1950, variance: 50 })
    expect(result?.outflow).toEqual({ plannedAmount: 1000, actualAmount: 925, variance: 75 })
  })

  it('returns planned categories with no actual transaction', async () => {
    mocks.findTransactions.mockResolvedValue([])
    const result = await getCurrentBudgetComparison('user-1')
    expect(result?.plannedWithoutActual).toEqual(expect.arrayContaining([expect.objectContaining({ categoryId: 'rent', actualAmount: 0 })]))
  })

  it('returns no comparison when no budget was selected', async () => {
    mocks.currentSelection.mockResolvedValue(undefined)
    await expect(getCurrentBudgetComparison('user-1')).resolves.toBeNull()
    expect(mocks.findBudget).not.toHaveBeenCalled()
  })

  it('does not expose a selected budget that is not owned by the user', async () => {
    mocks.findBudget.mockResolvedValue(undefined)
    await expect(getCurrentBudgetComparison('user-1')).resolves.toBeNull()
    expect(mocks.findTransactions).not.toHaveBeenCalled()
  })
})
