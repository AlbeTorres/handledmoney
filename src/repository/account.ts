import { db } from '@/db'
import { bankAccountsTable } from '@/db/schema'
import { CreateAccountSchema } from '@/lib/schema'
import * as z from 'zod'

export const createBankAccount = async ({
  name,
  bank,
  type,
  currency,
  balance,
  icon,
  color,
  userId,
}: z.infer<typeof CreateAccountSchema> & { userId: string }) => {
  try {
    const result = await db.insert(bankAccountsTable).values({
      userId,
      name,
      bank,
      type,
      currency,
      balance,
      icon,
      color,
    }).returning

    return result
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: 'Error creating account',
    }
  }
}
