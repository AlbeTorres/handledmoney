'use server'

import { auth } from '@/lib/auth'
import { getTransactionById } from '@/repository/transaction'
import { headers } from 'next/headers'

export const getTransactionByIdAction = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized', data: null }
  }

  try {
    const transaction = await getTransactionById(id, session.user.id)
    if (!transaction) {
      return { success: false, status: 404, message: 'Transaction not found', data: null }
    }
    return {
      success: true,
      status: 200,
      message: 'Transaction fetched successfully',
      data: transaction,
    }
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return { success: false, status: 500, message: 'Something went wrong', data: null }
  }
}
