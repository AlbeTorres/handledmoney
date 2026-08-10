'use server'

import { auth } from '@/lib/auth'
import { MAX_IMPORT_ROWS } from '@/lib/csv/constants'
import type { BulkImportInput, RowError } from '@/lib/csv/types'
import { CreateTransactionSchema } from '@/lib/schema'
import { getBankAccountById } from '@/repository/account'
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

export const createTransactionsBulkAction = async ({ accountId, rows }: BulkImportInput) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized', data: null }
  }

  try {
    // Ownership (CSV-IMP-01, M0.6/D4): the account must belong to the session
    // user. A foreign or unknown account inserts zero rows.
    const account = await getBankAccountById(accountId, session.user.id)
    if (!account) {
      return { success: false, status: 404, message: 'Account not found', data: null }
    }

    // Server-side size cap (D8): the client enforces the same limit.
    if (rows.length > MAX_IMPORT_ROWS) {
      return {
        success: false,
        status: 400,
        message: `Too many rows (max ${MAX_IMPORT_ROWS})`,
        data: null,
      }
    }

    // Per-row validation. The server injects accountId into every row (D2).
    // rowIndex is 0-based over the submitted rows; the UI displays +1.
    const errors: RowError[] = []
    const validatedRows: CreateTransactionValues[] = []
    rows.forEach((row, rowIndex) => {
      const validationResult = CreateTransactionSchema.safeParse({ ...row, accountId })

      if (!validationResult.success) {
        const issue = validationResult.error.issues[0]
        errors.push({
          rowIndex,
          field: issue?.path[0]?.toString() ?? 'unknown',
          reason: issue?.message ?? 'Invalid fields in transaction',
        })
      } else {
        validatedRows.push(validationResult.data)
      }
    })

    // All-or-nothing (M0.9): any row error → per-row report, zero inserts.
    if (errors.length > 0) {
      return { success: false, status: 400, message: 'Invalid fields', data: null, errors }
    }

    const transactions = await createTransactionsBulk(validatedRows, session.user.id)

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
