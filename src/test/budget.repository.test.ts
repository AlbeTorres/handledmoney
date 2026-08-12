import { beforeEach, describe, expect, it, vi } from 'vitest'

const { findBudget, findGroup, findItem, findCategory, insertReturning, updateReturning, conflictUpdate, selectWhere } = vi.hoisted(() => ({ findBudget: vi.fn(), findGroup: vi.fn(), findItem: vi.fn(), findCategory: vi.fn(), insertReturning: vi.fn(), updateReturning: vi.fn(), conflictUpdate: vi.fn(), selectWhere: vi.fn() }))
vi.mock('@/db', () => ({
  db: {
    query: { budgetsTable: { findFirst: findBudget }, budgetGroupsTable: { findFirst: findGroup }, budgetItemsTable: { findFirst: findItem }, categoriesTable: { findFirst: findCategory } },
    select: () => ({ from: () => ({ where: selectWhere }) }),
    insert: () => ({ values: () => ({ onConflictDoUpdate: (value: unknown) => { conflictUpdate(value); return { returning: insertReturning } } }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: updateReturning }) }) }),
  },
}))
import { deleteBudgetGroup, getBudgetWithActuals, selectCurrentBudget, updateBudgetItem } from '@/repository/budget'

describe('budget repository current selection', () => {
  beforeEach(() => vi.clearAllMocks())
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
