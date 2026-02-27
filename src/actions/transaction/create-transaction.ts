'use server'

import { auth } from '@/lib/auth'
import { CreateTransactionSchema } from '@/lib/schema'
import { createTransaction } from '@/repository/transaction'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import * as z from 'zod'

export const createTransactionAction = async (values: z.infer<typeof CreateTransactionSchema>) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  const validated = CreateTransactionSchema.safeParse(values)
  if (!validated.success) {
    return {
      success: false,
      status: 400,
      message: 'Invalid fields',
      errors: validated.error.flatten(),
    }
  }

  const { date, accountId, categoryId, payee, amount, notes, type } = validated.data

  try {
    const transaction = await createTransaction({
      userId: session.user.id,
      accountId,
      categoryId: categoryId ?? null,
      payee,
      amount,
      notes: notes ?? null,
      date,
      type,
    })

    revalidatePath('/transaction')

    return {
      success: true,
      status: 201,
      data: transaction,
      message: 'Transaction created successfully',
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}
