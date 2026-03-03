import { db } from '@/db'
import { bankAccountsTable, transactionsTable } from '@/db/schema'
import { CreateAccountSchema, UpdateAccountSchema } from '@/lib/schema'
import { and, eq, isNull } from 'drizzle-orm'
import * as z from 'zod'
import { transferTransaction } from './transaction'

export const createBankAccount = async ({
  name,
  bank,
  type,
  currency,
  icon,
  color,
  userId,
}: z.infer<typeof CreateAccountSchema> & { userId: string }) => {
  try {
    const result = await db
      .insert(bankAccountsTable)
      .values({
        userId,
        name,
        bank,
        type,
        currency,
        icon,
        color,
      })
      .returning()

    return result
  } catch (error) {
    console.error('Error creating account:', error)
  }
}

export const getBankAccountsByUser = async (userId: string) => {
  try {
    const accounts = await db
      .select()
      .from(bankAccountsTable)
      .where(and(eq(bankAccountsTable.userId, userId), isNull(bankAccountsTable.deletedAt)))

    return accounts
  } catch (error) {
    console.error('Error getting accounts:', error)
  }
}

export const getBankAccountById = async (id: string, userId: string) => {
  try {
    const result = await db
      .select()
      .from(bankAccountsTable)
      .where(
        and(
          eq(bankAccountsTable.id, id),
          eq(bankAccountsTable.userId, userId),
          isNull(bankAccountsTable.deletedAt),
        ),
      )
    return result[0]
  } catch (error) {
    console.error('Error getting account:', error)
  }
}

export const updateBankAccount = async (
  data: z.infer<typeof UpdateAccountSchema> & { userId: string },
) => {
  const { id, userId, ...values } = data
  try {
    const result = await db
      .update(bankAccountsTable)
      .set(values)
      .where(and(eq(bankAccountsTable.id, id), eq(bankAccountsTable.userId, userId)))
      .returning()
    return result
  } catch (error) {
    console.error('Error updating account:', error)
  }
}

export const softDeleteBankAccount = async (
  id: string,
  userId: string,
  transferToAccountId?: string,
) => {
  try {
    return await db.transaction(async tx => {
      if (transferToAccountId) {
        const transactions = await tx
          .select()
          .from(transactionsTable)
          .where(and(eq(transactionsTable.accountId, id), eq(transactionsTable.userId, userId)))

        const transactionIds = transactions.map(t => t.id)
        await transferTransaction(id, transferToAccountId, transactionIds)
      }

      const [result] = await tx
        .update(bankAccountsTable)
        .set({ deletedAt: new Date() })
        .where(and(eq(bankAccountsTable.id, id), eq(bankAccountsTable.userId, userId)))
        .returning()

      return result
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    throw new Error('Error deleting account')
  }
}
