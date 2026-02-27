'use server'

import { auth } from '@/lib/auth'
import { deleteTransaction } from '@/repository/transaction'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import * as z from 'zod'

const deleteSchema = z.object({ id: z.string().uuid() })

export const deleteTransactionAction = async (values: z.infer<typeof deleteSchema>) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  const validated = deleteSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, status: 400, message: 'Invalid id' }
  }

  try {
    await deleteTransaction(validated.data.id, session.user.id)
    revalidatePath('/transaction')
    return { success: true, status: 200, message: 'Transaction deleted successfully' }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}
