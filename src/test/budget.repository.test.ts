import { beforeEach, describe, expect, it, vi } from 'vitest'

const { findBudget, findGroup, findItem, findCategory, insertReturning, updateReturning, conflictUpdate, selectWhere, transaction, transactionSelect, transactionInsert } = vi.hoisted(() => ({ findBudget: vi.fn(), findGroup: vi.fn(), findItem: vi.fn(), findCategory: vi.fn(), insertReturning: vi.fn(), updateReturning: vi.fn(), conflictUpdate: vi.fn(), selectWhere: vi.fn(), transaction: vi.fn(), transactionSelect: vi.fn(), transactionInsert: vi.fn() }))
vi.mock('@/db', () => ({
  db: {
    query: { budgetsTable: { findFirst: findBudget }, budgetGroupsTable: { findFirst: findGroup }, budgetItemsTable: { findFirst: findItem }, categoriesTable: { findFirst: findCategory } },
    select: () => ({ from: () => ({ where: selectWhere }) }),
    insert: () => ({ values: () => ({ onConflictDoUpdate: (value: unknown) => { conflictUpdate(value); return { returning: insertReturning } } }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: updateReturning }) }) }),
    transaction,
  },
}))
import { createBudget, deleteBudgetGroup, getBudgetWithActuals, selectCurrentBudget, updateBudgetItem } from '@/repository/budget'

const draft = {
  userId: 'user-1', name: 'Plan', startDate: new Date('2026-01-01'), endDate: null,
  groups: [{ name: 'Outflow', calculationType: 'outflow' as const, sortOrder: 0, items: [{ categoryId: 'category-1', plannedAmount: -25 }] }],
}

describe('budget repository current selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    transaction.mockImplementation(async callback => callback({
      select: () => ({ from: () => ({ where: transactionSelect }) }),
      insert: () => ({ values: (values: unknown) => {
        const result = transactionInsert(values)
        return { returning: () => result, then: result.then.bind(result) }
      } }),
    }))
  })
  it('replaces the current selection for the same user', async () => {
    findBudget.mockResolvedValue({ id: 'budget-2', userId: 'user-1' })
    insertReturning.mockResolvedValue([{ userId: 'user-1', budgetId: 'budget-2' }])
    await expect(selectCurrentBudget('budget-2', 'user-1')).resolves.toEqual({ userId: 'user-1', budgetId: 'budget-2' })
    expect(conflictUpdate).toHaveBeenCalledOnce()
  })
  it('rejects deletion of the final income group', async () => {
    findGroup.mockResolvedValue({ id: 'group-1', budgetId: 'budget-1', calculationType: 'income' })
    findBudget.mockResolvedValue({ id: 'budget-1', userId: 'user-1' })
    selectWhere.mockResolvedValue([{ total: 1 }])
    await expect(deleteBudgetGroup('group-1', 'budget-1', 'user-1')).rejects.toThrow('A budget must include at least one income group')
  })
  it('rejects a foreign category replacement', async () => {
    findItem.mockResolvedValue({ id: 'item-1', groupId: 'group-1', budgetId: 'budget-1' })
    findBudget.mockResolvedValue({ id: 'budget-1', userId: 'user-1' })
    findGroup.mockResolvedValue({ id: 'group-1', budgetId: 'budget-1', calculationType: 'income' })
    findCategory.mockResolvedValue(undefined)
    await expect(updateBudgetItem({ id: 'item-1', categoryId: 'foreign-category' }, 'budget-1', 'user-1')).rejects.toThrow('Category not found')
  })
  it('rejects a category whose type conflicts with the item group', async () => {
    findItem.mockResolvedValue({ id: 'item-1', groupId: 'group-1', budgetId: 'budget-1' })
    findBudget.mockResolvedValue({ id: 'budget-1', userId: 'user-1' })
    findGroup.mockResolvedValue({ id: 'group-1', budgetId: 'budget-1', calculationType: 'income' })
    findCategory.mockResolvedValue({ id: 'expense-category', userId: 'user-1', type: 'expense' })
    await expect(updateBudgetItem({ id: 'item-1', categoryId: 'expense-category' }, 'budget-1', 'user-1')).rejects.toThrow('Category type does not match group type')
  })
  it('propagates the database duplicate-category constraint on update', async () => {
    findItem.mockResolvedValue({ id: 'item-1', groupId: 'group-1', budgetId: 'budget-1' })
    findBudget.mockResolvedValue({ id: 'budget-1', userId: 'user-1' })
    findGroup.mockResolvedValue({ id: 'group-1', budgetId: 'budget-1', calculationType: 'outflow' })
    findCategory.mockResolvedValue({ id: 'expense-category', userId: 'user-1', type: 'expense' })
    updateReturning.mockRejectedValue(new Error('budget_item_budget_category_unique'))
    await expect(updateBudgetItem({ id: 'item-1', categoryId: 'expense-category' }, 'budget-1', 'user-1')).rejects.toThrow('budget_item_budget_category_unique')
  })
  it('does not produce all-time actuals without an explicit comparison period', async () => {
    findBudget.mockResolvedValue({ id: 'budget-1', userId: 'user-1', groups: [{ calculationType: 'income', items: [{ id: 'item-1', categoryId: 'category-1', plannedAmount: '100' }] }] })
    const result = await getBudgetWithActuals('budget-1', 'user-1')
    expect(result?.groups[0].items[0].actualAmount).toBe(0)
  })
  it('rejects a foreign budget before writing a selection', async () => {
    findBudget.mockResolvedValue(undefined)
    await expect(selectCurrentBudget('foreign-budget', 'user-1')).resolves.toBeUndefined()
    expect(insertReturning).not.toHaveBeenCalled()
  })
})

describe('createBudget transaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    transaction.mockImplementation(async callback => callback({
      select: () => ({ from: () => ({ where: transactionSelect }) }),
      insert: () => ({ values: (values: unknown) => {
        const result = transactionInsert(values)
        return { returning: () => result, then: result.then.bind(result) }
      } }),
    }))
  })

  it('rejects missing, foreign, and incompatible categories before any write', async () => {
    transactionSelect.mockResolvedValue([])
    await expect(createBudget(draft)).rejects.toThrow('Category not found')
    expect(transactionInsert).not.toHaveBeenCalled()

    transactionSelect.mockResolvedValue([{ id: 'category-1', userId: 'user-2', type: 'expense' }])
    await expect(createBudget(draft)).rejects.toThrow('Category not found')
    expect(transactionInsert).not.toHaveBeenCalled()

    transactionSelect.mockResolvedValue([{ id: 'category-1', userId: 'user-1', type: 'income' }])
    await expect(createBudget(draft)).rejects.toThrow('Category type does not match group type')
    expect(transactionInsert).not.toHaveBeenCalled()
  })

  it('propagates a late item write failure to the transaction', async () => {
    transactionSelect.mockResolvedValue([{ id: 'category-1', userId: 'user-1', type: 'expense', name: 'Food' }])
    transactionInsert.mockResolvedValueOnce([{ id: 'budget-1' }]).mockResolvedValueOnce([{ id: 'group-1' }]).mockRejectedValueOnce(new Error('late item write'))
    await expect(createBudget(draft)).rejects.toThrow('late item write')
    expect(transaction).toHaveBeenCalledOnce()
  })
})
