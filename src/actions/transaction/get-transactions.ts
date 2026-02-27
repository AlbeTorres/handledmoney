'use server'

import { Transaction, TransactionResponse } from '@/interfaces'
import { auth } from '@/lib/auth'
import { getTransactionsPaginated, PaginatedTransactionsParams } from '@/repository/transaction'
import { headers } from 'next/headers'

export const getTransactionsAction = async (
  params: Omit<PaginatedTransactionsParams, 'userId'>,
) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized', data: null }
  }

  try {
    const result = await getTransactionsPaginated({
      userId: session.user.id,
      ...params,
    })

    if (!result.data) {
      return { success: false, status: 404, message: 'Not Found', data: null }
    }

    const transactions = result.data.map(parseTransaction)

    return { success: true, status: 200, data: { transactions } }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return { success: false, status: 500, message: 'Something went wrong', data: null }
  }
}

function parseTransaction(transaction: TransactionResponse): Transaction {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    payee: transaction.payee,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    notes: transaction.notes,
    date: transaction.date,
    userId: transaction.userId,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    deletedAt: transaction.deletedAt,
    accountName: transaction.account.name,
    categoryName: transaction.category?.name,
  }
}
