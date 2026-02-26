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

export const CreateAccountSchema = z.object({
  name: z.string().min(1, { message: 'Account name is required' }),
  bank: z.string().min(1, { message: 'Bank name is required' }),
  type: z.enum(['savings', 'checking', 'investment', 'credit', 'cash'], {
    required_error: 'Account type is required',
  }),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CAD'], {
    required_error: 'Currency is required',
  }),
  icon: z.string().min(1, { message: 'Please select an icon' }),
  color: z.string().regex(/^[0-9A-Fa-f]{6}$/, { message: 'Enter a valid hex color (e.g. 137FEC)' }),
})

export const UpdateAccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: 'Account name is required' }),
  bank: z.string().min(1, { message: 'Bank name is required' }),
  type: z.enum(['savings', 'checking', 'investment', 'credit', 'cash'], {
    required_error: 'Account type is required',
  }),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CAD'], {
    required_error: 'Currency is required',
  }),
  icon: z.string().min(1, { message: 'Please select an icon' }),
  color: z.string().regex(/^[0-9A-Fa-f]{6}$/, { message: 'Enter a valid hex color' }),
})

export const DeleteAccountSchema = z.object({
  id: z.string().uuid(),
  transferToAccountId: z.string().uuid().optional(),
})
export const categorySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(50).trim(),
  icon: z.string().min(1, { message: 'Please select an icon' }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Enter a valid hex color' }),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  parentId: z.string().uuid().optional().nullable(),
})

export const UpdateCategorySchema = categorySchema.partial().extend({
  id: z.string().uuid(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

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
