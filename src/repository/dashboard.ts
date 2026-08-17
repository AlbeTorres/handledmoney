import { db } from '@/db'
import {
  bankAccountsTable,
  budgetsTable,
  categoriesTable,
  currentBudgetsTable,
  transactionsTable,
} from '@/db/schema'
import { type DashboardPeriod, type DashboardSnapshot, utcRange } from '@/lib/finance-data'
import { and, eq, gte, isNull, lt } from 'drizzle-orm'

export async function getDashboardSnapshot(userId: string, period: DashboardPeriod): Promise<DashboardSnapshot> {
  const { start, nextStart } = utcRange(period)
  const [selection, categories, accounts, transactions] = await Promise.all([
    db.query.currentBudgetsTable.findFirst({
      where: eq(currentBudgetsTable.userId, userId),
    }),
    db.query.categoriesTable.findMany({
      where: eq(categoriesTable.userId, userId),
    }),
    db.query.bankAccountsTable.findMany({
      where: and(eq(bankAccountsTable.userId, userId), isNull(bankAccountsTable.deletedAt)),
    }),
    db.query.transactionsTable.findMany({
      where: and(
        eq(transactionsTable.userId, userId),
        gte(transactionsTable.date, start),
        lt(transactionsTable.date, nextStart),
        isNull(transactionsTable.deletedAt),
      ),
    }),
  ])
  const budget = selection?.budgetId
    ? await db.query.budgetsTable.findFirst({
        where: and(eq(budgetsTable.id, selection.budgetId), eq(budgetsTable.userId, userId)),
        with: { groups: { with: { items: true } } },
      })
    : null

  return { budget: budget ?? null, categories, accounts, transactions }
}
