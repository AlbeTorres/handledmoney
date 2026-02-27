import { db } from '@/db'
import { categoriesTable, transactionsTable } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'

export type CategorySelect = typeof categoriesTable.$inferSelect
export type CategoryInsert = typeof categoriesTable.$inferInsert

export const getCategoriesByUserId = async (userId: string, type?: 'income' | 'expense') => {
  try {
    const whereClause = type
      ? and(eq(categoriesTable.userId, userId), eq(categoriesTable.type, type))
      : eq(categoriesTable.userId, userId)

    const categories = await db.query.categoriesTable.findMany({
      where: whereClause,
      with: {
        children: true,
      },
      orderBy: (categories, { asc }) => [asc(categories.order)],
    })

    return categories
  } catch (error) {
    console.error('Error getting categories:', error)
    throw new Error('Error getting categories')
  }
}

export const getCategoryById = async (id: string, userId: string) => {
  try {
    const category = await db.query.categoriesTable.findFirst({
      where: and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)),
      with: {
        parent: true,
        children: true,
      },
    })
    return category
  } catch (error) {
    console.error('Error getting category:', error)
    throw new Error('Error getting category')
  }
}

export const createCategory = async (data: CategoryInsert) => {
  try {
    const [result] = await db.insert(categoriesTable).values(data).returning()
    return result
  } catch (error) {
    console.error('Error creating category:', error)
    throw new Error('Error creating category')
  }
}

export const updateCategory = async (id: string, userId: string, data: Partial<CategoryInsert>) => {
  try {
    const [result] = await db
      .update(categoriesTable)
      .set(data)
      .where(and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)))
      .returning()
    return result
  } catch (error) {
    console.error('Error updating category:', error)
    throw new Error('Error updating category')
  }
}

export const deleteCategory = async (id: string, userId: string) => {
  try {
    // Check for transactions
    const transactions = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.categoryId, id), eq(transactionsTable.userId, userId)))

    if (Number(transactions[0].count) > 0) {
      throw new Error('Cannot delete category with associated transactions')
    }

    const [result] = await db
      .delete(categoriesTable)
      .where(and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)))
      .returning()
    return result
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

export const countCategoriesByUserId = async (userId: string) => {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, userId))
    return Number(result[0].count)
  } catch (error) {
    console.error('Error counting categories:', error)
    throw new Error('Error counting categories')
  }
}

export const createManyCategories = async (data: CategoryInsert[]) => {
  try {
    const result = await db.insert(categoriesTable).values(data).returning()
    return result
  } catch (error) {
    console.error('Error creating multiple categories:', error)
    throw new Error('Error creating multiple categories')
  }
}
