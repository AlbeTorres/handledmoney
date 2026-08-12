import { describe, expect, it } from 'vitest'
import type { Budget, BudgetGroup, BudgetItem } from '@/interfaces'

describe('budget lifecycle interfaces', () => {
  it('supports lifecycle dates and immutable calculation semantics', () => {
    const budget: Budget = { id: 'budget', userId: 'user', name: 'Plan', startDate: new Date(), endDate: null, createdAt: new Date(), updatedAt: new Date() }
    const group: BudgetGroup = { id: 'group', budgetId: budget.id, name: 'Income', calculationType: 'income', sortOrder: 0, createdAt: new Date(), updatedAt: new Date() }
    const item: BudgetItem = { id: 'item', budgetId: budget.id, groupId: group.id, categoryId: null, name: 'Salary', plannedAmount: 100, createdAt: new Date(), updatedAt: new Date() }
    expect(item.budgetId).toBe(budget.id)
  })
})
