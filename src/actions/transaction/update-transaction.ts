'use server'

import { auth } from '@/lib/auth'
import { UpdateTransactionSchema } from '@/lib/schema'
import { updateTransaction } from '@/repository/transaction'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import * as z from 'zod'

export const updateTransactionAction = async (values: z.infer<typeof UpdateTransactionSchema>) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  const validated = UpdateTransactionSchema.safeParse(values)
  if (!validated.success) {
    return {
      success: false,
      status: 400,
      message: 'Invalid fields',
      errors: validated.error.flatten(),
    }
  }

  const { id, ...rest } = validated.data

  try {
    const transaction = await updateTransaction({
      id,
      userId: session.user.id,
      ...rest,
    })

    revalidatePath('/transaction')

    return {
      success: true,
      status: 200,
      data: transaction,
      message: 'Transaction updated successfully',
    }
  } catch (error) {
    console.error('Error updating transaction:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}
