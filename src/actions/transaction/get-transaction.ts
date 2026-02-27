'use server'

import { auth } from '@/lib/auth'
import { getTransactionById } from '@/repository/transaction'
import { headers } from 'next/headers'

export const getTransactionAction = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  try {
    const transaction = await getTransactionById(id, session.user.id)
    if (!transaction) {
      return { success: false, status: 404, message: 'Transaction not found' }
    }
    return { success: true, status: 200, data: transaction }
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}
