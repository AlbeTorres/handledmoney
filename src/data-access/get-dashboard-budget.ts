import { auth } from '@/lib/auth'
import { DashboardPlanCategory, DashboardPlanGroup } from '@/lib/dashboard/plan'
import { getDashboardBudget } from '@/repository/budget-dashboard'
import { headers } from 'next/headers'

export const getDashboardBudgetData = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user.id

  if (!userId) {
    return {
      success: false,
      message: 'Unauthorized User',
      data: null,
    }
  }

  try {
    const budget = await getDashboardBudget(userId)

    if (!budget) {
      return {
        success: false,
        message: 'Budget not found',
        data: [],
      }
    }

    // Groups are ordered by sortOrder in SQL; re-sorting here keeps the
    // contract explicit regardless of driver behavior.
    const groups: DashboardPlanGroup[] = budget.groups
      .toSorted((left, right) => left.sortOrder - right.sortOrder)
      .map(group => {
        const kind = group.calculationType === 'income' ? 'income' : 'expense'
        const categories: DashboardPlanCategory[] = group.items.map(item => ({
          id: item.id,
          categoryId: item.categoryId,
          name: item.category?.name ?? item.name,
          planned: normalizeFinite(item.plannedAmount),
        }))
        return {
          id: group.id,
          name: group.name,
          kind,
          sortOrder: group.sortOrder,
          planned: categories.reduce((sum, category) => sum + category.planned, 0),
          categories,
        }
      })

    const data = {
      id: budget.id,
      name: budget.name,
      incomePlanned: groups
        .filter(group => group.kind === 'income')
        .reduce((sum, group) => sum + group.planned, 0),
      expensePlanned: groups
        .filter(group => group.kind === 'expense')
        .reduce((sum, group) => sum + group.planned, 0),
      groups,
    }

    return {
      success: true,
      message: 'Budget fetched successfully',
      data: data,
    }
  } catch (error) {
    console.error('Error getting budget:', error)
    return {
      success: false,
      message: 'Error getting budget',
      data: null,
    }
  }
}

function normalizeFinite(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
