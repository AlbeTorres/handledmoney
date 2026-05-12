import { db } from '@/db'
import {
  budgetGroupsTable,
  budgetItemsTable,
  budgetsTable,
  categoriesTable,
  transactionsTable,
} from '@/db/schema'
import {
  CreateBudgetGroupSchema,
  CreateBudgetItemSchema,
  CreateBudgetSchema,
  UpdateBudgetItemSchema,
  UpdateBudgetSchema,
} from '@/lib/schema'
import type { BudgetGroupWithItems, BudgetItemWithActual, BudgetWithGroups } from '@/interfaces'
import { and, eq, sql, sum } from 'drizzle-orm'
import z from 'zod'

type CreateBudgetValues = z.infer<typeof CreateBudgetSchema> & { userId: string }
type UpdateBudgetValues = z.infer<typeof UpdateBudgetSchema>
type CreateBudgetGroupValues = z.infer<typeof CreateBudgetGroupSchema>
type CreateBudgetItemValues = z.infer<typeof CreateBudgetItemSchema>
type UpdateBudgetItemValues = z.infer<typeof UpdateBudgetItemSchema>

// ── Default groups created with every new budget ───────────────────────────────

const DEFAULT_GROUPS: Array<{ name: string; type: CreateBudgetGroupValues['type']; sortOrder: number }> = [
  { name: 'Income', type: 'income', sortOrder: 0 },
  { name: 'Bills', type: 'bills', sortOrder: 1 },
  { name: 'Variable Expenses', type: 'variable_expenses', sortOrder: 2 },
  { name: 'Debt', type: 'debt', sortOrder: 3 },
  { name: 'Savings', type: 'savings', sortOrder: 4 },
  { name: 'Investments', type: 'investments', sortOrder: 5 },
]

// ── Create ─────────────────────────────────────────────────────────────────────

export const createBudget = async ({ userId, name, month, year }: CreateBudgetValues) => {
  return db.transaction(async tx => {
    const [budget] = await tx
      .insert(budgetsTable)
      .values({ userId, name, month, year })
      .returning()

    await tx.insert(budgetGroupsTable).values(
      DEFAULT_GROUPS.map(g => ({
        budgetId: budget.id,
        name: g.name,
        type: g.type,
        sortOrder: g.sortOrder,
      })),
    )

    return budget
  })
}

// ── Read ───────────────────────────────────────────────────────────────────────

export const getBudgetsByUser = async (userId: string) => {
  return db.query.budgetsTable.findMany({
    where: eq(budgetsTable.userId, userId),
    orderBy: (b, { desc }) => [desc(b.year), desc(b.month)],
  })
}

export const getBudgetById = async (id: string, userId: string) => {
  return db.query.budgetsTable.findFirst({
    where: and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId)),
    with: {
      groups: {
        orderBy: (g, { asc }) => [asc(g.sortOrder)],
        with: {
          items: {
            with: { category: true },
          },
        },
      },
    },
  })
}

/**
 * Returns the budget enriched with actual spending from transactions.
 * Actuals are computed with a single aggregation query, then merged in JS —
 * avoids N+1 queries.
 */
export const getBudgetWithActuals = async (
  id: string,
  userId: string,
): Promise<BudgetWithGroups | null> => {
  const budget = await getBudgetById(id, userId)
  if (!budget) return null

  // ── 1. Collect all categoryIds referenced by this budget's items ──────────
  const categoryIds = budget.groups
    .flatMap(g => g.items)
    .map(i => i.categoryId)
    .filter((c): c is string => c !== null)

  // ── 2. Single query: sum of transactions per category for this period ─────
  const actualsMap: Record<string, number> = {}

  if (categoryIds.length > 0) {
    const rows = await db
      .select({
        categoryId: transactionsTable.categoryId,
        total: sum(transactionsTable.amount),
      })
      .from(transactionsTable)
      .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
      .where(
        and(
          eq(transactionsTable.userId, userId),
          sql`EXTRACT(MONTH FROM ${transactionsTable.date}) = ${budget.month}`,
          sql`EXTRACT(YEAR FROM ${transactionsTable.date}) = ${budget.year}`,
          sql`${transactionsTable.categoryId} = ANY(ARRAY[${sql.join(
            categoryIds.map(c => sql`${c}::uuid`),
            sql`, `,
          )}])`,
        ),
      )
      .groupBy(transactionsTable.categoryId)

    for (const row of rows) {
      if (row.categoryId) {
        actualsMap[row.categoryId] = parseFloat(row.total ?? '0')
      }
    }
  }

  // ── 3. Merge actuals into the budget tree ─────────────────────────────────
  let totalIncome = 0
  let totalAllocated = 0

  const groups: BudgetGroupWithItems[] = budget.groups.map(g => {
    let groupPlanned = 0
    let groupActual = 0

    const items: BudgetItemWithActual[] = g.items.map(item => {
      const plannedAmount = parseFloat(String(item.plannedAmount))
      const actualAmount = item.categoryId ? (actualsMap[item.categoryId] ?? 0) : 0
      const remaining = plannedAmount - actualAmount
      const usageRate = plannedAmount > 0 ? actualAmount / plannedAmount : NaN

      groupPlanned += plannedAmount
      groupActual += actualAmount

      return {
        ...item,
        plannedAmount,
        actualAmount,
        remaining,
        usageRate,
      }
    })

    if (g.type === 'income') {
      totalIncome += groupPlanned
    } else {
      totalAllocated += groupPlanned
    }

    return { ...g, items, groupPlanned, groupActual }
  })

  return {
    ...budget,
    groups,
    totalIncome,
    totalAllocated,
    remainingToAllocate: totalIncome - totalAllocated,
  }
}

// ── Update ─────────────────────────────────────────────────────────────────────

export const updateBudget = async ({ id, ...values }: UpdateBudgetValues, userId: string) => {
  const [updated] = await db
    .update(budgetsTable)
    .set(values)
    .where(and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId)))
    .returning()

  return updated
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export const deleteBudget = async (id: string, userId: string) => {
  const [deleted] = await db
    .delete(budgetsTable)
    .where(and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId)))
    .returning()

  return deleted
}

// ── Budget Group ───────────────────────────────────────────────────────────────

export const createBudgetGroup = async (values: CreateBudgetGroupValues) => {
  const [group] = await db.insert(budgetGroupsTable).values(values).returning()
  return group
}

export const deleteBudgetGroup = async (id: string) => {
  const [deleted] = await db
    .delete(budgetGroupsTable)
    .where(eq(budgetGroupsTable.id, id))
    .returning()
  return deleted
}

// ── Budget Item ────────────────────────────────────────────────────────────────

export const createBudgetItem = async (values: CreateBudgetItemValues) => {
  const [item] = await db
    .insert(budgetItemsTable)
    .values({
      ...values,
      plannedAmount: String(values.plannedAmount),
    })
    .returning()

  return item
}

export const updateBudgetItem = async ({ id, plannedAmount, ...rest }: UpdateBudgetItemValues) => {
  const updatePayload: Partial<typeof budgetItemsTable.$inferInsert> = { ...rest }
  if (plannedAmount !== undefined) updatePayload.plannedAmount = String(plannedAmount)

  const [updated] = await db
    .update(budgetItemsTable)
    .set(updatePayload)
    .where(eq(budgetItemsTable.id, id))
    .returning()

  return updated
}

export const deleteBudgetItem = async (id: string) => {
  const [deleted] = await db
    .delete(budgetItemsTable)
    .where(eq(budgetItemsTable.id, id))
    .returning()

  return deleted
}
