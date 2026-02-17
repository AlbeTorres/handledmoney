import * as z from 'zod'

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password is required' }),
  code: z.optional(z.string()),
})
export const ResetSchema = z.object({
  email: z.string().email(),
})
export const ChangePasswordSchema = z.object({
  password: z.string().min(8, { message: 'Minimun 8 characters required' }),
})
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: 'Minimun 8 characters required' }),
  name: z.string().min(1, { message: 'Name is required' }),
})

export const insertAccountSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
})

export const updateAccountSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  id: z.string().uuid(),
  type: z.string().optional(),
  balance: z.number().optional(),
})
export const insertCategorySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  id: z.string().uuid(),
})
export const insertTransactionSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  categoryId: z.string().nullable().optional(),
  payee: z.string(),
  amount: z.number(),
  notes: z.string().nullable().optional(),
})
export const transactionFormSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  categoryId: z.string().nullable().optional(),
  payee: z.string(),
  amount: z.string(),
  notes: z.string().nullable().optional(),
})

export const updateTransactionSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date().optional(),
  accountId: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  payee: z.string().optional(),
  amount: z.number().optional(),
  notes: z.string().nullable().optional(),
})
