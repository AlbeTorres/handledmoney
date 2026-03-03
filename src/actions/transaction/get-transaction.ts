'use server'

import { auth } from '@/lib/auth'
import { getTransactionById, getTransactionsByAccountId } from '@/repository/transaction'
import { headers } from 'next/headers'

import { Transaction, TransactionResponse } from '@/interfaces'
import { getTransactionsPaginated, PaginatedTransactionsParams } from '@/repository/transaction'

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

export const getTransactionsPaginatedAction = async (
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

    return { success: true, status: 200, data: [...transactions] }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return { success: false, status: 500, message: 'Something went wrong', data: null }
  }
}

export const getTransactionsByAccountIdAction = async (accountId: string) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized', data: null }
  }

  try {
    const transactions = await getTransactionsByAccountId(accountId, session.user.id)
    if (!transactions) {
      return { success: false, status: 404, message: 'Transactions not found', data: null }
    }
    return {
      success: true,
      status: 200,
      message: 'Transactions fetched successfully',
      data: transactions,
    }
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
    payee: transaction.payee || '',
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
