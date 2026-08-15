import type { CreateBudgetValues } from './schema'

export type BudgetTemplateId = 'starter' | 'blank'

type PlanGroup = CreateBudgetValues['groups'][number]

export type NormalizedPlan = Array<{
  name: string
  calculationType: PlanGroup['calculationType']
  sortOrder: number
  items: Array<{ categoryId: string; plannedAmount: number }>
}>

type NormalizablePlanGroup = {
  name: string
  calculationType: PlanGroup['calculationType']
  items: Array<{ categoryId: string; plannedAmount: number }>
}

export const starterTemplateGroups = Object.freeze([
  Object.freeze({ name: 'Income', calculationType: 'income' as const, sortOrder: 0, items: Object.freeze([]) }),
  Object.freeze({ name: 'Bills', calculationType: 'outflow' as const, sortOrder: 1, items: Object.freeze([]) }),
  Object.freeze({ name: 'Variable Expenses', calculationType: 'outflow' as const, sortOrder: 2, items: Object.freeze([]) }),
  Object.freeze({ name: 'Debt', calculationType: 'outflow' as const, sortOrder: 3, items: Object.freeze([]) }),
  Object.freeze({ name: 'Savings', calculationType: 'outflow' as const, sortOrder: 4, items: Object.freeze([]) }),
  Object.freeze({ name: 'Investments', calculationType: 'outflow' as const, sortOrder: 5, items: Object.freeze([]) }),
])

export function createTemplateGroups(templateId: BudgetTemplateId): CreateBudgetValues['groups'] {
  if (templateId === 'blank') {
    return [{ name: 'Income', calculationType: 'income', sortOrder: 0, items: [] }]
  }

  return starterTemplateGroups.map((group, sortOrder) => ({
    name: group.name,
    calculationType: group.calculationType,
    sortOrder,
    items: [],
  }))
}

export function normalizePlan<T extends NormalizablePlanGroup>(groups: T[]): NormalizedPlan {
  return groups.map(({ name, calculationType, items }, sortOrder) => ({
    name,
    calculationType,
    sortOrder,
    items: items.map(({ categoryId, plannedAmount }) => ({ categoryId, plannedAmount })),
  }))
}

export function arePlansEqual(left: NormalizedPlan, right: NormalizedPlan): boolean {
  if (left.length !== right.length) return false

  return left.every((leftGroup, groupIndex) => {
    const rightGroup = right[groupIndex]
    if (!rightGroup) return false
    if (
      leftGroup.name !== rightGroup.name ||
      leftGroup.calculationType !== rightGroup.calculationType ||
      leftGroup.sortOrder !== rightGroup.sortOrder ||
      leftGroup.items.length !== rightGroup.items.length
    ) {
      return false
    }

    return leftGroup.items.every((leftItem, itemIndex) => {
      const rightItem = rightGroup.items[itemIndex]
      if (!rightItem) return false
      return leftItem.categoryId === rightItem.categoryId && leftItem.plannedAmount === rightItem.plannedAmount
    })
  })
}
