'use server'

import { auth } from '@/lib/auth'
import { CreateTransactionSchema } from '@/lib/schema'
import { createTransaction, createTransactionsBulk } from '@/repository/transaction'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import * as z from 'zod'

type CreateTransactionValues = z.infer<typeof CreateTransactionSchema>

export const createTransactionAction = async (values: CreateTransactionValues) => {
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
      categoryId: categoryId,
      payee,
      amount,
      notes: notes,
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

export const createTransactionsBulkAction = async (transactions: CreateTransactionValues[]) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized', data: null }
  }

  // Validar todas las transacciones
  const errors: Array<{ index: number; error: string }> = []
  const validatedTransactions = transactions.map((transaction, index) => {
    const validationResult = CreateTransactionSchema.safeParse(transaction)

    if (!validationResult.success) {
      errors.push({ index, error: 'Invalid fields in transaction' })
    }
    return validationResult.success ? validationResult.data : null
  })

  // Filtrar las transacciones válidas
  const validTransactions = validatedTransactions.filter(t => t !== null)

  if (errors.length > 0) {
    return {
      success: false,
      status: 400,
      message: 'Invalid fields',
      data: null,
      errors,
    }
  }

  try {
    const transactions = await createTransactionsBulk(validTransactions, session.user.id)

    revalidatePath('/transaction')

    return {
      success: true,
      status: 201,
      data: transactions,
      message: `${transactions.length} transactions created successfully!`,
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return { success: false, status: 500, message: 'Something went wrong', data: null }
  }
}
