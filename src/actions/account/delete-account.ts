'use server'
import { auth } from '@/lib/auth'
import { DeleteAccountSchema } from '@/lib/schema'
import { getBankAccountById, softDeleteBankAccount } from '@/repository/account'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import * as z from 'zod'

export const removeBankAccount = async (values: z.infer<typeof DeleteAccountSchema>) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user.id

  if (!userId) {
    return {
      success: false,
      status: 401,
      message: 'Unauthorized User',
    }
  }

  const validatedFields = DeleteAccountSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      status: 400,
      message: 'Invalid fields!',
    }
  }

  const { id, transferToAccountId } = validatedFields.data

  try {
    // Check if account has transactions and if we need a transfer account
    const response = await getBankAccountById(id, userId)

    if (!response) {
      return {
        success: false,
        status: 404,
        message: 'Account not found',
      }
    }

    const account = response

    if (account.transactionsCount > 0 && !transferToAccountId) {
      return {
        success: false,
        status: 409,
        message: 'Account has transactions. Please select a transfer account.',
      }
    }

    await softDeleteBankAccount(id, userId, transferToAccountId)

    revalidatePath('/account')

    return {
      success: true,
      status: 200,
      message: 'Account deleted successfully!',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      status: 500,
      message: 'Something went wrong',
    }
  }
}
