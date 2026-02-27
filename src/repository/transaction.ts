import { db } from '@/db'
import { bankAccountsTable, categoriesTable, transactionsTable } from '@/db/schema'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'

export const getTransactionsByAccountId = async (accountId: string, userId: string) => {
  try {
    const transactions = await db
      .select({
        id: transactionsTable.id,
        amount: transactionsTable.amount,
        payee: transactionsTable.payee,
        notes: transactionsTable.notes,
        date: transactionsTable.date,
        accountId: transactionsTable.accountId,
        accountName: bankAccountsTable.name,
        categoryId: transactionsTable.categoryId,
        categoryName: categoriesTable.name,
        userId: transactionsTable.userId,
      })
      .from(transactionsTable)
      .leftJoin(bankAccountsTable, eq(transactionsTable.accountId, bankAccountsTable.id))
      .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
      .where(and(eq(transactionsTable.accountId, accountId), eq(transactionsTable.userId, userId)))
      .orderBy(desc(transactionsTable.date))

    return transactions
  } catch (error) {
    console.error('Error fetching transactions by account:', error)
    return []
  }
}

export const transferTransaction = async (
  accountId: string,
  newAccountId: string,
  transactionsIds: string[],
) => {
  if (transactionsIds.length === 0) return

  try {
    await db.transaction(async tx => {
      // 1. Get the sum of the transactions being moved
      // We do this to update the account balances accurately
      const movedTransactions = await tx
        .select({ amount: transactionsTable.amount })
        .from(transactionsTable)
        .where(
          and(
            inArray(transactionsTable.id, transactionsIds),
            eq(transactionsTable.accountId, accountId), // Security: ensure they belong to source
          ),
        )

      const totalAmount = movedTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)

      // 2. Move the transactions to the new account
      await tx
        .update(transactionsTable)
        .set({ accountId: newAccountId })
        .where(inArray(transactionsTable.id, transactionsIds))

      // 3. Subtract from the OLD account balance
      await tx
        .update(bankAccountsTable)
        .set({
          balance: sql`${bankAccountsTable.balance} - ${totalAmount.toString()}`,
        })
        .where(eq(bankAccountsTable.id, accountId))

      // 4. Add to the NEW account balance
      await tx
        .update(bankAccountsTable)
        .set({
          balance: sql`${bankAccountsTable.balance} + ${totalAmount.toString()}`,
        })
        .where(eq(bankAccountsTable.id, newAccountId))
    })

    return { success: true }
  } catch (error) {
    console.error('Transfer failed:', error)
    throw new Error('Could not complete the transaction transfer.')
  }
}
