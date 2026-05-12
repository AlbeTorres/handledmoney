import type { BudgetGroupType } from '@/lib/schema'

// ── Raw DB shapes ─────────────────────────────────────────────────────────────

export interface Budget {
  id: string
  userId: string
  name: string
  month: number
  year: number
  createdAt: Date
  updatedAt: Date
}

export interface BudgetGroup {
  id: string
  budgetId: string
  name: string
  type: BudgetGroupType
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface BudgetItem {
  id: string
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
