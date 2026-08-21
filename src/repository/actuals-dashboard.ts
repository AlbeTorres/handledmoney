import { db } from '@/db'
import { categoriesTable, transactionsTable } from '@/db/schema'
import type { DashboardActual } from '@/interfaces/actuals'
import type { DashboardRange } from '@/lib/dashboard/period'
import { and, eq, gte, isNull, lt, sql } from 'drizzle-orm'

function normalizeFinite(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * One owner-scoped, range-bounded, soft-delete-filtered SQL aggregate of the
 * dashboard's actuals. Rows are grouped by (category, type, UTC month) and
 * joined to categories WITHOUT an archived_at filter so archived categories
 * keep their display context. Individual transaction rows never reach Node.
 *
 * `month` follows the 0–11 JavaScript convention via `extract(month ...) - 1`;
 * `transaction.date` is a PostgreSQL `timestamp`, so UTC bounds and UTC month
 * extraction are not subject to session-time-zone drift.
 */
export async function getDashboardActuals(
  userId: string,
  range: DashboardRange,
): Promise<DashboardActual[]> {
  const month = sql<number>`extract(month from ${transactionsTable.date})::int - 1`

  const rows = await db
    .select({
      categoryId: transactionsTable.categoryId,
      categoryName: categoriesTable.name,
      type: transactionsTable.type,
      month,
      total: sql<string>`coalesce(sum(${transactionsTable.amount}), 0)`,
    })
    .from(transactionsTable)
    .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
    .where(
      and(
        eq(transactionsTable.userId, userId),
        gte(transactionsTable.date, range.start),
        lt(transactionsTable.date, range.nextStart),
        isNull(transactionsTable.deletedAt),
      ),
    )
    .groupBy(transactionsTable.categoryId, transactionsTable.type, categoriesTable.name, month)

  return rows.map(row => ({
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    type: row.type,
    month: Number(row.month),
    total: normalizeFinite(row.total),
  }))
}
