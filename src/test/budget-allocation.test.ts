import {
  clampProgressPercentage,
  getBudgetAllocationTotals,
  getCategoryIncomePercentage,
} from '@/lib/budget-allocation'
import type { CreateBudgetValues } from '@/lib/schema'
import { describe, expect, it } from 'vitest'

type BudgetGroups = CreateBudgetValues['groups']

const incomeGroup = (items: Array<{ categoryId: string; plannedAmount: number }>): BudgetGroups[number] => ({
  name: 'Income',
  calculationType: 'income',
  sortOrder: 0,
  items,
})

const outflowGroup = (name: string, items: Array<{ categoryId: string; plannedAmount: number }>, sortOrder = 1): BudgetGroups[number] => ({
  name,
  calculationType: 'outflow',
  sortOrder,
  items,
})

const item = (categoryId: string, plannedAmount: number) => ({ categoryId, plannedAmount })

describe('getBudgetAllocationTotals', () => {
  it('sums planned income amounts for a single income group', () => {
    const groups: BudgetGroups = [
      incomeGroup([item('category-1', 1000), item('category-2', 500)]),
    ]
    expect(getBudgetAllocationTotals(groups)).toEqual({ totalIncome: 1500, totalAllocated: 0, unassigned: 1500 })
  })

  it('sums planned income amounts across several income groups', () => {
    const groups: BudgetGroups = [
      incomeGroup([item('category-1', 1000)]),
      { name: 'Side Income', calculationType: 'income', sortOrder: 1, items: [item('category-2', 300)] },
    ]
    expect(getBudgetAllocationTotals(groups)).toEqual({ totalIncome: 1300, totalAllocated: 0, unassigned: 1300 })
  })

  it('only sums outflow groups into totalAllocated, excluding income amounts', () => {
    const groups: BudgetGroups = [
      incomeGroup([item('category-1', 1000)]),
      outflowGroup('Bills', [item('category-2', 400)]),
      outflowGroup('Savings', [item('category-3', 200)]),
    ]
    expect(getBudgetAllocationTotals(groups)).toEqual({ totalIncome: 1000, totalAllocated: 600, unassigned: 400 })
  })

  it('returns a positive unassigned when income exceeds outflow', () => {
    const groups: BudgetGroups = [
      incomeGroup([item('category-1', 1000)]),
      outflowGroup('Bills', [item('category-2', 400)]),
    ]
    expect(getBudgetAllocationTotals(groups).unassigned).toBe(600)
  })

  it('returns a zero unassigned when income equals outflow', () => {
    const groups: BudgetGroups = [
      incomeGroup([item('category-1', 1000)]),
      outflowGroup('Bills', [item('category-2', 1000)]),
    ]
    expect(getBudgetAllocationTotals(groups).unassigned).toBe(0)
  })

  it('returns a negative unassigned when outflow exceeds income (over-allocation)', () => {
    const groups: BudgetGroups = [
      incomeGroup([item('category-1', 1000)]),
      outflowGroup('Bills', [item('category-2', 1200)]),
    ]
    expect(getBudgetAllocationTotals(groups).unassigned).toBe(-200)
  })

  it('returns all-zero totals for an empty groups array', () => {
    expect(getBudgetAllocationTotals([])).toEqual({ totalIncome: 0, totalAllocated: 0, unassigned: 0 })
  })
})

describe('getCategoryIncomePercentage', () => {
  it('computes the share of a category against positive total income', () => {
    expect(getCategoryIncomePercentage(250, 1000)).toBe(25)
  })

  it('returns 0 when total income is zero, never dividing by zero', () => {
    expect(getCategoryIncomePercentage(250, 0)).toBe(0)
    expect(getCategoryIncomePercentage(0, 0)).toBe(0)
  })

  it('keeps the real value above 100 and does not clamp', () => {
    expect(getCategoryIncomePercentage(1500, 1000)).toBe(150)
  })

  it('returns 0 for an amount of zero', () => {
    expect(getCategoryIncomePercentage(0, 1000)).toBe(0)
  })
})

describe('clampProgressPercentage', () => {
  it('clamps values below 0 to 0', () => {
    expect(clampProgressPercentage(-5)).toBe(0)
    expect(clampProgressPercentage(0)).toBe(0)
  })

  it('clamps values above 100 to 100', () => {
    expect(clampProgressPercentage(150)).toBe(100)
    expect(clampProgressPercentage(100)).toBe(100)
  })

  it('keeps values inside the closed interval [0, 100] unchanged', () => {
    expect(clampProgressPercentage(50)).toBe(50)
    expect(clampProgressPercentage(12.5)).toBe(12.5)
  })
})
