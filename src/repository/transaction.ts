import { db } from '@/db'
import { bankAccountsTable, categoriesTable, transactionsTable } from '@/db/schema'
import { CreateTransactionSchema, UpdateTransactionSchema } from '@/lib/schema'
import { and, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import z from 'zod'

type CreateTransactionValues = z.infer<typeof CreateTransactionSchema> & { userId: string }
type UpdateTransactionValues = z.infer<typeof UpdateTransactionSchema> & { userId: string }

export interface PaginatedTransactionsParams {
  userId: string
  type: 'income' | 'expense'
  page?: number
  limit?: number
  search?: string
}

export const createTransaction = async ({
  userId,
  accountId,
  categoryId,
  payee,
  amount,
  notes,
  date,
  type,
}: CreateTransactionValues) => {
  return db.transaction(async tx => {
    // 1. Insert base transaction
    const [transaction] = await tx
      .insert(transactionsTable)
      .values({
        userId: userId,
        accountId: accountId,
        categoryId: categoryId ?? null,
        payee: payee,
        amount: String(amount),
        notes: notes ?? null,
        date: date,
        type: type,
      })
      .returning()

    // 3. Update account balance & transaction count
    const sign = type === 'income' ? '+' : '-'
    await tx
      .update(bankAccountsTable)
      .set({
        balance: sql`${bankAccountsTable.balance} ${sql.raw(sign)} ${String(amount)}`,
        transactionsCount: sql`${bankAccountsTable.transactionsCount} + 1`,
      })
      .where(eq(bankAccountsTable.id, accountId))

    return transaction
  })
}

export const transferTransaction = async (
  accountId: string,
  newAccountId: string,
  transactionsIds: string[],
) => {
  if (transactionsIds.length === 0) return

  try {
    await db.transaction(async tx => {
      const movedTransactions = await tx
        .select({ amount: transactionsTable.amount })
        .from(transactionsTable)
        .where(
          and(
            inArray(transactionsTable.id, transactionsIds),
            eq(transactionsTable.accountId, accountId),
          ),
        )

      const totalAmount = movedTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)

      await tx
        .update(transactionsTable)
        .set({ accountId: newAccountId })
        .where(inArray(transactionsTable.id, transactionsIds))

      await tx
        .update(bankAccountsTable)
        .set({ balance: sql`${bankAccountsTable.balance} - ${totalAmount.toString()}` })
        .where(eq(bankAccountsTable.id, accountId))

      await tx
        .update(bankAccountsTable)
        .set({ balance: sql`${bankAccountsTable.balance} + ${totalAmount.toString()}` })
        .where(eq(bankAccountsTable.id, newAccountId))
    })

    return { success: true }
  } catch (error) {
    console.error('Transfer failed:', error)
    throw new Error('Could not complete the transaction transfer.')
  }
}
export const updateTransaction = async ({
  userId,
  id,
  accountId,
  categoryId,
  payee,
  amount,
  notes,
  date,
  type,
}: UpdateTransactionValues) => {
  return db.transaction(async tx => {
    // 1. Fetch existing
    const [existing] = await tx
      .select({
        amount: transactionsTable.amount,
        type: transactionsTable.type,
        accountId: transactionsTable.accountId,
      })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)))

    if (!existing) throw new Error('Transaction not found')

    // 2. Build update payload
    const updatePayload: Partial<typeof transactionsTable.$inferInsert> = {}
    if (payee !== undefined) updatePayload.payee = payee
    if (notes !== undefined) updatePayload.notes = notes
    if (date !== undefined) updatePayload.date = date
    if (categoryId !== undefined) updatePayload.categoryId = categoryId
    if (accountId !== undefined) updatePayload.accountId = accountId
    if (type !== undefined) updatePayload.type = type
    if (amount !== undefined) updatePayload.amount = String(amount)

    const [updated] = await tx
      .update(transactionsTable)
      .set(updatePayload)
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)))
      .returning()

    // 3. Recalculate balance
    const oldAmount = parseFloat(existing.amount ?? '0')
    const oldType = existing.type
    const newAmount = amount ?? oldAmount
    const newType = type ?? oldType

    const oldEffect = oldType === 'income' ? -oldAmount : +oldAmount
    const newEffect = newType === 'income' ? +newAmount : -newAmount

    const accountChanged = accountId !== undefined && accountId !== existing.accountId
    const somethingChanged =
      accountChanged ||
      (amount !== undefined && newAmount !== oldAmount) ||
      (type !== undefined && newType !== oldType)

    if (somethingChanged) {
      if (accountChanged) {
        // Revert effect on old account
        await tx
          .update(bankAccountsTable)
          .set({ balance: sql`${bankAccountsTable.balance} + ${oldEffect}` })
          .where(eq(bankAccountsTable.id, existing.accountId))

        // Apply new effect on new account
        await tx
          .update(bankAccountsTable)
          .set({ balance: sql`${bankAccountsTable.balance} + ${newEffect}` })
          .where(eq(bankAccountsTable.id, accountId))
      } else {
        // Same account — just apply the net delta
        const delta = oldEffect + newEffect
        await tx
          .update(bankAccountsTable)
          .set({ balance: sql`${bankAccountsTable.balance} + ${delta}` })
          .where(eq(bankAccountsTable.id, existing.accountId))
      }
    }

    return updated
  })
}

export const getTransactionById = async (id: string, userId: string) => {
  return await db.query.transactionsTable.findFirst({
    where: and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)),
    with: {
      category: true,
      account: true,
      incomeDetails: true,
      expenseDetails: true,
    },
  })
}

export const getTransactionsByAccountId = async (accountId: string, userId: string) => {
  try {
    const transactions = await db
      .select({
        id: transactionsTable.id,
        amount: transactionsTable.amount,
        payee: transactionsTable.payee,
        notes: transactionsTable.notes,
        date: transactionsTable.date,
        accountId: transactionsTable.accountId,
        accountName: bankAccountsTable.name,
        categoryId: transactionsTable.categoryId,
        categoryName: categoriesTable.name,
        userId: transactionsTable.userId,
      })
      .from(transactionsTable)
      .leftJoin(bankAccountsTable, eq(transactionsTable.accountId, bankAccountsTable.id))
      .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
      .where(and(eq(transactionsTable.accountId, accountId), eq(transactionsTable.userId, userId)))
      .orderBy(desc(transactionsTable.date))

    return transactions
  } catch (error) {
    console.error('Error fetching transactions by account:', error)
    return []
  }
}

export const getTransactionsPaginated = async ({
  userId,
  type,
  page = 1,
  limit = 20,
  search,
}: PaginatedTransactionsParams) => {
  const offset = (page - 1) * limit

  const searchCondition = search
    ? or(
        ilike(transactionsTable.payee, `%${search}%`),
        ilike(transactionsTable.notes, `%${search}%`),
      )
    : undefined

  const whereClause = and(
    eq(transactionsTable.userId, userId),
    eq(transactionsTable.type, type),
    searchCondition,
  )

  const [rows, totalResult] = await Promise.all([
    db.query.transactionsTable.findMany({
      where: whereClause,
      with: {
        category: true,
        account: true,
        ...(type === 'income' ? { incomeDetails: true } : { expenseDetails: true }),
      },
      orderBy: desc(transactionsTable.date),
      limit,
      offset,
    }),
    db.select({ count: count() }).from(transactionsTable).where(whereClause),
  ])

  const total = Number(totalResult[0]?.count ?? 0)

  return {
    data: rows,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export const createTransactionsBulk = async (
  transactions: z.infer<typeof CreateTransactionSchema>[],
  userId: string,
) => {
  return db.transaction(async tx => {
    const createdTransactions = await tx
      .insert(transactionsTable)
      .values(
        transactions.map(t => ({
          ...t,
          userId,
          amount: t.amount.toString(),
        })),
      )
      .returning()

    return createdTransactions
  })
}

// // ── Types ─────────────────────────────────────────────────────────────────────

// export type TransactionInsert = typeof transactionsTable.$inferInsert
// export type IncomeDetailsInsert = typeof incomeDetailsTable.$inferInsert
// export type ExpenseDetailsInsert = typeof expenseDetailsTable.$inferInsert

// export interface PaginatedTransactionsParams {
//   userId: string
//   type: 'income' | 'expense'
//   page?: number
//   limit?: number
//   search?: string
// }

// export interface PaginatedResult<T> {
//   data: T[]
//   total: number
//   page: number
//   totalPages: number
// }

// // ── Paginated list ─────────────────────────────────────────────────────────────

// // ── Single transaction ─────────────────────────────────────────────────────────

// export const getTransactionById = async (id: string, userId: string) => {
//   return db.query.transactionsTable.findFirst({
//     where: and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)),
//     with: {
//       category: true,
//       account: true,
//       incomeDetails: true,
//       expenseDetails: true,
//     },
//   })
// }

// // ── Create (atomic) ────────────────────────────────────────────────────────────

// export interface CreateTransactionInput {
//   userId: string
//   accountId: string
//   categoryId?: string | null
//   payee: string
//   amount: number
//   notes?: string | null
//   date: Date
//   type: 'income' | 'expense'
//   incomeDetails?: Omit<IncomeDetailsInsert, 'id' | 'transactionId'>
//   expenseDetails?: Omit<ExpenseDetailsInsert, 'id' | 'transactionId'>
// }

// export const createTransactionWithDetails = async (input: CreateTransactionInput) => {
//   return db.transaction(async tx => {
//     // 1. Insert base transaction
//     const [transaction] = await tx
//       .insert(transactionsTable)
//       .values({
//         userId: input.userId,
//         accountId: input.accountId,
//         categoryId: input.categoryId ?? null,
//         payee: input.payee,
//         amount: String(input.amount),
//         notes: input.notes ?? null,
//         date: input.date,
//         type: input.type,
//       })
//       .returning()

//     // 2. Insert detail row
//     if (input.type === 'income' && input.incomeDetails) {
//       await tx.insert(incomeDetailsTable).values({
//         transactionId: transaction.id,
//         incomeType: input.incomeDetails.incomeType,
//         billingType: input.incomeDetails.billingType ?? null,
//         hoursWorked: input.incomeDetails.hoursWorked ?? null,
//         wagePerHour: input.incomeDetails.wagePerHour ?? null,
//         overtimeHours: input.incomeDetails.overtimeHours ?? null,
//         overtimeWagePerHour: input.incomeDetails.overtimeWagePerHour ?? null,
//         grossAmount: input.incomeDetails.grossAmount ?? null,
//         taxesWithheld: input.incomeDetails.taxesWithheld ?? null,
//         taxBreakdown: input.incomeDetails.taxBreakdown ?? null,
//       })
//     }

//     if (input.type === 'expense' && input.expenseDetails) {
//       await tx.insert(expenseDetailsTable).values({
//         transactionId: transaction.id,
//         salesTax: String(input.expenseDetails.salesTax ?? '0'),
//         taxRate: input.expenseDetails.taxRate ?? null,
//         receiptUrl: input.expenseDetails.receiptUrl ?? null,
//         receiptHash: input.expenseDetails.receiptHash ?? null,
//         isDeductible: input.expenseDetails.isDeductible ?? false,
//         deductionCategory: input.expenseDetails.deductionCategory ?? null,
//       })
//     }

//     // 3. Update account balance & transaction count
//     const sign = input.type === 'income' ? '+' : '-'
//     await tx
//       .update(bankAccountsTable)
//       .set({
//         balance: sql`${bankAccountsTable.balance} ${sql.raw(sign)} ${String(input.amount)}`,
//         transactionsCount: sql`${bankAccountsTable.transactionsCount} + 1`,
//       })
//       .where(eq(bankAccountsTable.id, input.accountId))

//     return transaction
//   })
// }

// // ── Update (atomic) ────────────────────────────────────────────────────────────

// export interface UpdateTransactionInput {
//   id: string
//   userId: string
//   accountId?: string
//   categoryId?: string | null
//   payee?: string
//   amount?: number
//   notes?: string | null
//   date?: Date
//   type?: 'income' | 'expense'
//   incomeDetails?: Partial<Omit<IncomeDetailsInsert, 'id' | 'transactionId'>>
//   expenseDetails?: Partial<Omit<ExpenseDetailsInsert, 'id' | 'transactionId'>>
// }

// export const updateTransactionWithDetails = async (input: UpdateTransactionInput) => {
//   return db.transaction(async tx => {
//     // 1. Fetch existing to compute balance delta
//     const [existing] = await tx
//       .select({
//         amount: transactionsTable.amount,
//         type: transactionsTable.type,
//         accountId: transactionsTable.accountId,
//       })
//       .from(transactionsTable)
//       .where(and(eq(transactionsTable.id, input.id), eq(transactionsTable.userId, input.userId)))

//     if (!existing) throw new Error('Transaction not found')

//     // 2. Build update payload
//     const updatePayload: Partial<TransactionInsert> = {}
//     if (input.payee !== undefined) updatePayload.payee = input.payee
//     if (input.notes !== undefined) updatePayload.notes = input.notes
//     if (input.date !== undefined) updatePayload.date = input.date
//     if (input.categoryId !== undefined) updatePayload.categoryId = input.categoryId
//     if (input.accountId !== undefined) updatePayload.accountId = input.accountId
//     if (input.type !== undefined) updatePayload.type = input.type
//     if (input.amount !== undefined) updatePayload.amount = String(input.amount)

//     const [updated] = await tx
//       .update(transactionsTable)
//       .set(updatePayload)
//       .where(and(eq(transactionsTable.id, input.id), eq(transactionsTable.userId, input.userId)))
//       .returning()

//     // 3. Upsert detail row
//     if (input.incomeDetails) {
//       await tx
//         .insert(incomeDetailsTable)
//         .values({ transactionId: input.id, incomeType: 'other', ...input.incomeDetails })
//         .onConflictDoUpdate({
//           target: incomeDetailsTable.transactionId,
//           set: input.incomeDetails as Partial<typeof incomeDetailsTable.$inferInsert>,
//         })
//     }

//     if (input.expenseDetails) {
//       await tx
//         .insert(expenseDetailsTable)
//         .values({ transactionId: input.id, ...input.expenseDetails })
//         .onConflictDoUpdate({
//           target: expenseDetailsTable.transactionId,
//           set: input.expenseDetails as Partial<typeof expenseDetailsTable.$inferInsert>,
//         })
//     }

//     // 4. Recalculate account balance if amount changed
//     if (input.amount !== undefined && input.amount !== parseFloat(existing.amount ?? '0')) {
//       const oldAmount = parseFloat(existing.amount ?? '0')
//       const newAmount = input.amount
//       const accountId = input.accountId ?? existing.accountId
//       const type = input.type ?? existing.type

//       // Reverse old effect
//       const reverseSign = type === 'income' ? '-' : '+'
//       // Apply new effect
//       const newSign = type === 'income' ? '+' : '-'
//       const delta = newAmount - oldAmount
//       const finalSign = delta >= 0 ? '+' : '-'
//       const absDelta = Math.abs(delta)

//       await tx
//         .update(bankAccountsTable)
//         .set({
//           balance: sql`${bankAccountsTable.balance} ${sql.raw(newSign === reverseSign ? '+' : finalSign)} ${String(absDelta)}`,
//         })
//         .where(eq(bankAccountsTable.id, accountId))
//     }

//     return updated
//   })
// }

// // ── Delete ─────────────────────────────────────────────────────────────────────

// export const deleteTransaction = async (id: string, userId: string) => {
//   return db.transaction(async tx => {
//     const [transaction] = await tx
//       .select({
//         amount: transactionsTable.amount,
//         type: transactionsTable.type,
//         accountId: transactionsTable.accountId,
//       })
//       .from(transactionsTable)
//       .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)))

//     if (!transaction) throw new Error('Transaction not found')

//     // Delete base (cascade removes detail rows automatically)
//     const [deleted] = await tx
//       .delete(transactionsTable)
//       .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)))
//       .returning()

//     // Reverse balance effect
//     const sign = transaction.type === 'income' ? '-' : '+'
//     await tx
//       .update(bankAccountsTable)
//       .set({
//         balance: sql`${bankAccountsTable.balance} ${sql.raw(sign)} ${transaction.amount}`,
//         transactionsCount: sql`GREATEST(${bankAccountsTable.transactionsCount} - 1, 0)`,
//       })
//       .where(eq(bankAccountsTable.id, transaction.accountId))

//     return deleted
//   })
// }

// // ── Bulk (legacy — used by account transfer) ───────────────────────────────────

// export const getTransactionsByAccountId = async (accountId: string, userId: string) => {
//   try {
//     const transactions = await db
//       .select({
//         id: transactionsTable.id,
//         amount: transactionsTable.amount,
//         payee: transactionsTable.payee,
//         notes: transactionsTable.notes,
//         date: transactionsTable.date,
//         accountId: transactionsTable.accountId,
//         accountName: bankAccountsTable.name,
//         categoryId: transactionsTable.categoryId,
//         categoryName: categoriesTable.name,
//         userId: transactionsTable.userId,
//       })
//       .from(transactionsTable)
//       .leftJoin(bankAccountsTable, eq(transactionsTable.accountId, bankAccountsTable.id))
//       .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
//       .where(and(eq(transactionsTable.accountId, accountId), eq(transactionsTable.userId, userId)))
//       .orderBy(desc(transactionsTable.date))

//     return transactions
//   } catch (error) {
//     console.error('Error fetching transactions by account:', error)
//     return []
//   }
// }
