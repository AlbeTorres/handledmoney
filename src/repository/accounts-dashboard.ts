import { db } from '@/db'
import { bankAccountsTable } from '@/db/schema'
import type { DashboardAccount } from '@/interfaces/accounts'
import { and, eq, isNull } from 'drizzle-orm'

function normalizeFinite(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * One owner-scoped, soft-delete-filtered account read for the account widget.
 * The precise current-schema predicate is `user_id = $userId AND deleted_at
 * IS NULL`; `bank_account` has no active or status column, so in this schema
 * non-deleted is the sole persisted active-state predicate and no additional
 * filter is invented here. An empty result is the widget's empty state.
 */
export async function getDashboardAccounts(userId: string): Promise<DashboardAccount[]> {
  const rows = await db
    .select({
      id: bankAccountsTable.id,
      name: bankAccountsTable.name,
      type: bankAccountsTable.type,
      currency: bankAccountsTable.currency,
      balance: bankAccountsTable.balance,
    })
    .from(bankAccountsTable)
    .where(and(eq(bankAccountsTable.userId, userId), isNull(bankAccountsTable.deletedAt)))

  return rows.map(row => ({ ...row, balance: normalizeFinite(row.balance) }))
}
