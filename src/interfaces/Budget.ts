import type { BudgetCalculationType } from '@/lib/schema'

// ── Raw DB shapes ─────────────────────────────────────────────────────────────

export interface Budget {
  id: string
  userId: string
  name: string
  startDate: Date
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
}

/** Lightweight budget summary used by the budget library. */
export interface BudgetListItem extends Budget {
  totalIncome: number
  totalAllocated: number
  remainingToAllocate: number
}

export interface BudgetGroup {
  id: string
  budgetId: string
  name: string
  calculationType: BudgetCalculationType
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface BudgetItem {
  id: string
  budgetId: string
  groupId: string
  categoryId: string | null
  name: string
  plannedAmount: number
  createdAt: Date
  updatedAt: Date
}

// ── Computed / enriched shapes (not stored in DB) ─────────────────────────────

export interface BudgetItemWithActual extends BudgetItem {
  /** Sum of transactions for this item's category in the budget period */
  actualAmount: number
  /** plannedAmount - actualAmount */
  remaining: number
  /** actualAmount / plannedAmount (0–1), NaN when plannedAmount = 0 */
  usageRate: number
}

export interface BudgetGroupWithItems extends BudgetGroup {
  items: BudgetItemWithActual[]
  /** Sum of all plannedAmounts in the group */
  groupPlanned: number
  /** Sum of all actualAmounts in the group */
  groupActual: number
}

export interface BudgetWithGroups extends Budget {
  groups: BudgetGroupWithItems[]
  /** Total income planned (groups of type 'income') */
  totalIncome: number
  /** Total allocated (all non-income groups) */
  totalAllocated: number
  /** totalIncome - totalAllocated — the zero-sum remainder */
  remainingToAllocate: number
}

/** A current budget's plan compared with every categorized transaction owned by its user. */
export interface BudgetCategoryComparison {
  categoryId: string
  categoryName: string
  type: 'income' | 'expense'
  plannedAmount: number
  actualAmount: number
  variance: number
}

export interface BudgetComparisonTotals {
  plannedAmount: number
  actualAmount: number
  variance: number
}

export interface CurrentBudgetComparison {
  budget: Budget
  categories: BudgetCategoryComparison[]
  actualWithoutPlan: BudgetCategoryComparison[]
  plannedWithoutActual: BudgetCategoryComparison[]
  income: BudgetComparisonTotals
  outflow: BudgetComparisonTotals
}
