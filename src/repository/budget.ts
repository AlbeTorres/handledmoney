import { db } from '@/db'
import {
  budgetGroupsTable,
  budgetItemsTable,
  budgetsTable,
  categoriesTable,
  currentBudgetsTable,
  transactionsTable,
} from '@/db/schema'
import {
  CreateBudgetGroupSchema,
  CreateBudgetItemSchema,
  CreateBudgetSchema,
  DuplicateBudgetSchema,
  UpdateBudgetGroupSchema,
  UpdateBudgetItemSchema,
  UpdateBudgetSchema,
} from '@/lib/schema'
import type { BudgetCategoryComparison, BudgetGroupWithItems, BudgetItemWithActual, BudgetListItem, BudgetWithGroups, CurrentBudgetComparison } from '@/interfaces'
import { and, count, desc, eq, inArray } from 'drizzle-orm'
import z from 'zod'

type CreateBudgetValues = z.infer<typeof CreateBudgetSchema> & { userId: string }
type UpdateBudgetValues = z.infer<typeof UpdateBudgetSchema>
type CreateBudgetGroupValues = z.infer<typeof CreateBudgetGroupSchema>
type CreateBudgetItemValues = z.infer<typeof CreateBudgetItemSchema>
type UpdateBudgetItemValues = z.infer<typeof UpdateBudgetItemSchema>
type UpdateBudgetGroupValues = z.infer<typeof UpdateBudgetGroupSchema>
type DuplicateBudgetValues = z.infer<typeof DuplicateBudgetSchema>

export const createBudget = async ({ userId, name, startDate, endDate, groups }: CreateBudgetValues) =>
  db.transaction(async tx => {
    const categoryIds = groups.flatMap(group => group.items.map(item => item.categoryId))
    const categories = categoryIds.length
      ? await tx.select().from(categoriesTable).where(and(inArray(categoriesTable.id, categoryIds), eq(categoriesTable.userId, userId)))
      : []
    const categoriesById = new Map(categories.map(category => [category.id, category]))

    for (const group of groups) {
      for (const item of group.items) {
        const category = categoriesById.get(item.categoryId)
        if (!category || category.userId !== userId) throw new Error('Category not found')
        const expectedType = group.calculationType === 'income' ? 'income' : 'expense'
        if (category.type !== expectedType) throw new Error('Category type does not match group type')
      }
    }

    const [budget] = await tx.insert(budgetsTable).values({ userId, name, startDate, endDate: endDate ?? null }).returning()
    const createdGroups = await Promise.all(groups.map(group => tx.insert(budgetGroupsTable).values({
      budgetId: budget.id,
      name: group.name,
      calculationType: group.calculationType,
      sortOrder: group.sortOrder,
    }).returning().then(([created]) => created)))
    const items = groups.flatMap((group, groupIndex) => group.items.map(item => ({
      budgetId: budget.id,
      groupId: createdGroups[groupIndex].id,
      categoryId: item.categoryId,
      name: categoriesById.get(item.categoryId)!.name,
      plannedAmount: String(item.plannedAmount),
    })))
    if (items.length) await tx.insert(budgetItemsTable).values(items)
    return budget
  })

export const getBudgetsByUser = async (userId: string): Promise<BudgetListItem[]> => {
  const budgets = await db.query.budgetsTable.findMany({
    where: eq(budgetsTable.userId, userId),
    orderBy: [desc(budgetsTable.startDate)],
    with: { groups: { with: { items: true } } },
  })
  return budgets.map(({ groups, ...budget }) => {
    let totalIncome = 0
    let totalAllocated = 0
    for (const group of groups) {
      const planned = group.items.reduce((total, item) => total + Number(item.plannedAmount), 0)
      if (group.calculationType === 'income') totalIncome += planned
      else totalAllocated += planned
    }
    return { ...budget, totalIncome, totalAllocated, remainingToAllocate: totalIncome - totalAllocated }
  })
}

export const getBudgetById = async (id: string, userId: string) =>
  db.query.budgetsTable.findFirst({
    where: and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId)),
    with: { groups: { orderBy: (groups, { asc }) => [asc(groups.sortOrder)], with: { items: { with: { category: true } } } } },
  })

export const getBudgetWithActuals = async (id: string, userId: string): Promise<BudgetWithGroups | null> => {
  const budget = await getBudgetById(id, userId)
  if (!budget) return null
  // Budget dates are historical metadata, not an applicability range. Until Phase 4
  // explicitly selects the current plan for dashboard comparison, reporting actuals here
  // would incorrectly present all-time transactions as period actuals.
  const actualsMap: Record<string, number> = {}

  let totalIncome = 0
  let totalAllocated = 0
  const groups: BudgetGroupWithItems[] = budget.groups.map(group => {
    let groupPlanned = 0
    let groupActual = 0
    const items: BudgetItemWithActual[] = group.items.map(item => {
      const plannedAmount = Number(item.plannedAmount)
      const actualAmount = item.categoryId ? (actualsMap[item.categoryId] ?? 0) : 0
      groupPlanned += plannedAmount
      groupActual += actualAmount
      return { ...item, plannedAmount, actualAmount, remaining: plannedAmount - actualAmount, usageRate: plannedAmount ? actualAmount / plannedAmount : Number.NaN }
    })
    if (group.calculationType === 'income') totalIncome += groupPlanned
    else totalAllocated += groupPlanned
    return { ...group, items, groupPlanned, groupActual }
  })
  return { ...budget, groups, totalIncome, totalAllocated, remainingToAllocate: totalIncome - totalAllocated }
}

export const updateBudget = async ({ id, ...values }: UpdateBudgetValues, userId: string) => {
  const current = await db.query.budgetsTable.findFirst({ where: and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId)) })
  if (!current) return undefined
  const startDate = values.startDate ?? current.startDate
  const endDate = values.endDate === undefined ? current.endDate : values.endDate
  if (endDate && endDate < startDate) throw new Error('End date must be on or after start date')
  const [updated] = await db.update(budgetsTable).set(values).where(and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId))).returning()
  return updated
}

export const deleteBudget = async (id: string, userId: string) => {
  const [deleted] = await db.delete(budgetsTable).where(and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId))).returning()
  return deleted
}

export const selectCurrentBudget = async (budgetId: string, userId: string) => {
  const budget = await db.query.budgetsTable.findFirst({ where: and(eq(budgetsTable.id, budgetId), eq(budgetsTable.userId, userId)) })
  if (!budget) return undefined
  const [selection] = await db.insert(currentBudgetsTable).values({ userId, budgetId }).onConflictDoUpdate({ target: currentBudgetsTable.userId, set: { budgetId } }).returning()
  return selection
}

export const getCurrentBudget = async (userId: string) =>
  db.query.currentBudgetsTable.findFirst({ where: eq(currentBudgetsTable.userId, userId) })

/**
 * Compares transactions exclusively with the budget manually selected by the user.
 * Budget dates are intentionally never used as transaction filters: they document
 * when a financial reality began or ended, not which plan is current.
 */
export const getCurrentBudgetComparison = async (userId: string): Promise<CurrentBudgetComparison | null> => {
  const selection = await getCurrentBudget(userId)
  if (!selection?.budgetId) return null

  // Resolve the selected budget through the owner-scoped lookup. This makes a stale
  // or foreign current_budget row harmless rather than exposing another user's plan.
  const budget = await getBudgetById(selection.budgetId, userId)
  if (!budget) return null

  const transactions = await db.query.transactionsTable.findMany({
    where: eq(transactionsTable.userId, userId),
    with: { category: true },
  })

  const plannedByCategory = new Map<string, BudgetCategoryComparison>()
  for (const group of budget.groups) {
    for (const item of group.items) {
      if (!item.categoryId) continue
      plannedByCategory.set(item.categoryId, {
        categoryId: item.categoryId,
        categoryName: item.category?.name ?? item.name,
        type: group.calculationType === 'income' ? 'income' : 'expense',
        plannedAmount: Number(item.plannedAmount),
        actualAmount: 0,
        variance: Number(item.plannedAmount),
      })
    }
  }

  const actualByCategory = new Map<string, { categoryName: string; type: 'income' | 'expense'; actualAmount: number }>()
  for (const transaction of transactions) {
    if (!transaction.categoryId) continue
    const current = actualByCategory.get(transaction.categoryId)
    actualByCategory.set(transaction.categoryId, {
      categoryName: transaction.category?.name ?? 'Uncategorized',
      type: transaction.type,
      actualAmount: (current?.actualAmount ?? 0) + Number(transaction.amount),
    })
  }

  const categories: BudgetCategoryComparison[] = []
  const plannedWithoutActual: BudgetCategoryComparison[] = []
  for (const planned of plannedByCategory.values()) {
    const actual = actualByCategory.get(planned.categoryId)?.actualAmount ?? 0
    const comparison = { ...planned, actualAmount: actual, variance: planned.plannedAmount - actual }
    categories.push(comparison)
    if (actual === 0) plannedWithoutActual.push(comparison)
  }

  const actualWithoutPlan: BudgetCategoryComparison[] = []
  for (const [categoryId, actual] of actualByCategory) {
    if (plannedByCategory.has(categoryId)) continue
    actualWithoutPlan.push({
      categoryId,
      categoryName: actual.categoryName,
      type: actual.type,
      plannedAmount: 0,
      actualAmount: actual.actualAmount,
      variance: -actual.actualAmount,
    })
  }

  const allCategories = [...categories, ...actualWithoutPlan]
  const totalsFor = (type: 'income' | 'expense') => {
    const plannedAmount = allCategories
      .filter(category => category.type === type)
      .reduce((total, category) => total + category.plannedAmount, 0)
    const actualAmount = allCategories
      .filter(category => category.type === type)
      .reduce((total, category) => total + category.actualAmount, 0)
    return { plannedAmount, actualAmount, variance: plannedAmount - actualAmount }
  }
  const budgetSummary = {
    id: budget.id,
    userId: budget.userId,
    name: budget.name,
    startDate: budget.startDate,
    endDate: budget.endDate,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
  }
  return {
    budget: budgetSummary,
    categories,
    actualWithoutPlan,
    plannedWithoutActual,
    income: totalsFor('income'),
    outflow: totalsFor('expense'),
  }
}

export const duplicateBudget = async ({ id, name, startDate }: DuplicateBudgetValues, userId: string) => {
  const source = await getBudgetById(id, userId)
  if (!source) return undefined

  return db.transaction(async tx => {
    const [budget] = await tx.insert(budgetsTable).values({
      userId,
      name: name?.trim() || `${source.name} copy`,
      startDate,
      endDate: null,
    }).returning()
    const groupIdMap = new Map<string, string>()
    for (const group of source.groups) {
      const [createdGroup] = await tx.insert(budgetGroupsTable).values({
        budgetId: budget.id,
        name: group.name,
        calculationType: group.calculationType,
        sortOrder: group.sortOrder,
      }).returning()
      groupIdMap.set(group.id, createdGroup.id)
    }
    if (source.groups.some(group => group.items.length > 0)) {
      await tx.insert(budgetItemsTable).values(source.groups.flatMap(group => group.items.map(item => ({
        budgetId: budget.id,
        groupId: groupIdMap.get(group.id)!,
        categoryId: item.categoryId,
        name: item.name,
        plannedAmount: item.plannedAmount,
      }))))
    }
    return budget
  })
}

export const createBudgetGroup = async (values: CreateBudgetGroupValues, userId: string) => {
  const budget = await db.query.budgetsTable.findFirst({ where: and(eq(budgetsTable.id, values.budgetId), eq(budgetsTable.userId, userId)) })
  if (!budget) return undefined
  const [group] = await db.insert(budgetGroupsTable).values(values).returning()
  return group
}

export const updateBudgetGroup = async ({ id, name }: UpdateBudgetGroupValues, budgetId: string, userId: string) => {
  const budget = await db.query.budgetsTable.findFirst({ where: and(eq(budgetsTable.id, budgetId), eq(budgetsTable.userId, userId)) })
  if (!budget) return undefined
  const [updated] = await db.update(budgetGroupsTable).set({ name }).where(and(eq(budgetGroupsTable.id, id), eq(budgetGroupsTable.budgetId, budgetId))).returning()
  return updated
}

export const deleteBudgetGroup = async (id: string, budgetId: string, userId: string) => {
  const group = await db.query.budgetGroupsTable.findFirst({ where: and(eq(budgetGroupsTable.id, id), eq(budgetGroupsTable.budgetId, budgetId)) })
  if (!group) return undefined
  const budget = await db.query.budgetsTable.findFirst({ where: and(eq(budgetsTable.id, budgetId), eq(budgetsTable.userId, userId)) })
  if (!budget) return undefined
  if (group.calculationType === 'income') {
    const [incomeGroups] = await db.select({ total: count() }).from(budgetGroupsTable).where(and(eq(budgetGroupsTable.budgetId, budgetId), eq(budgetGroupsTable.calculationType, 'income')))
    if (Number(incomeGroups.total) <= 1) throw new Error('A budget must include at least one income group')
  }
  const [deleted] = await db.delete(budgetGroupsTable).where(and(eq(budgetGroupsTable.id, id), eq(budgetGroupsTable.budgetId, budgetId))).returning()
  return deleted
}

export const createBudgetItem = async (values: CreateBudgetItemValues, userId: string) => {
  const group = await db.query.budgetGroupsTable.findFirst({ where: eq(budgetGroupsTable.id, values.groupId) })
  if (!group) return undefined
  const budget = await db.query.budgetsTable.findFirst({ where: and(eq(budgetsTable.id, group.budgetId), eq(budgetsTable.userId, userId)) })
  if (!budget) return undefined
  if (values.categoryId) {
    const category = await db.query.categoriesTable.findFirst({ where: and(eq(categoriesTable.id, values.categoryId), eq(categoriesTable.userId, userId)) })
    if (!category) throw new Error('Category not found')
    if ((group.calculationType === 'income') !== (category.type === 'income')) throw new Error('Category type does not match group type')
  }
  const [item] = await db.insert(budgetItemsTable).values({ ...values, budgetId: group.budgetId, plannedAmount: String(values.plannedAmount) }).returning()
  return item
}

export const updateBudgetItem = async ({ id, plannedAmount, ...rest }: UpdateBudgetItemValues, budgetId: string, userId: string) => {
  const item = await db.query.budgetItemsTable.findFirst({ where: and(eq(budgetItemsTable.id, id), eq(budgetItemsTable.budgetId, budgetId)) })
  if (!item) return undefined
  const budget = await db.query.budgetsTable.findFirst({ where: and(eq(budgetsTable.id, budgetId), eq(budgetsTable.userId, userId)) })
  if (!budget) return undefined
  if (rest.categoryId !== undefined && rest.categoryId !== null) {
    const group = await db.query.budgetGroupsTable.findFirst({ where: and(eq(budgetGroupsTable.id, item.groupId), eq(budgetGroupsTable.budgetId, budgetId)) })
    if (!group) return undefined
    const category = await db.query.categoriesTable.findFirst({ where: and(eq(categoriesTable.id, rest.categoryId), eq(categoriesTable.userId, userId)) })
    if (!category) throw new Error('Category not found')
    if ((group.calculationType === 'income') !== (category.type === 'income')) throw new Error('Category type does not match group type')
  }
  const payload: Partial<typeof budgetItemsTable.$inferInsert> = { ...rest }
  if (plannedAmount !== undefined) payload.plannedAmount = String(plannedAmount)
  const [updated] = await db.update(budgetItemsTable).set(payload).where(and(eq(budgetItemsTable.id, id), eq(budgetItemsTable.budgetId, budgetId))).returning()
  return updated
}

export const deleteBudgetItem = async (id: string, budgetId: string, userId: string) => {
  const budget = await db.query.budgetsTable.findFirst({ where: and(eq(budgetsTable.id, budgetId), eq(budgetsTable.userId, userId)) })
  if (!budget) return undefined
  const [deleted] = await db.delete(budgetItemsTable).where(and(eq(budgetItemsTable.id, id), eq(budgetItemsTable.budgetId, budgetId))).returning()
  return deleted
}
