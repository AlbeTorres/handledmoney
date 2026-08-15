import type { CreateBudgetValues } from './schema'

type BudgetGroups = CreateBudgetValues['groups']

export type BudgetAllocationTotals = {
  totalIncome: number
  totalAllocated: number
  unassigned: number
}

export function getBudgetAllocationTotals(groups: BudgetGroups): BudgetAllocationTotals {
  let totalIncome = 0
  let totalAllocated = 0

  for (const group of groups) {
    const groupTotal = group.items.reduce((sum, item) => sum + item.plannedAmount, 0)
    if (group.calculationType === 'income') {
      totalIncome += groupTotal
    } else {
      totalAllocated += groupTotal
    }
  }

  return { totalIncome, totalAllocated, unassigned: totalIncome - totalAllocated }
}

export function getCategoryIncomePercentage(amount: number, totalIncome: number): number {
  if (totalIncome <= 0) return 0
  return (amount / totalIncome) * 100
}

export function clampProgressPercentage(percentage: number): number {
  return Math.min(100, Math.max(0, percentage))
}
