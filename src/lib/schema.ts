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
  termsAccepted: z.literal(true, { message: 'You must accept the Terms & Conditions' }),
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
  color: z.string().regex(/^[0-9A-Fa-f]{6}$/, { message: 'Enter a valid hex color (e.g. 137FEC)' }),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  parentId: z.string().uuid().optional().nullable(),
})

export const UpdateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: 'Name is required' }).max(50).trim(),
  icon: z.string().min(1, { message: 'Please select an icon' }),
  color: z.string().regex(/^[0-9A-Fa-f]{6}$/, { message: 'Enter a valid hex color (e.g. 137FEC)' }),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  parentId: z.string().uuid().optional().nullable(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

// ── Income details ────────────────────────────────────────────────────────────
export const incomeDetailsSchema = z
  .object({
    incomeType: z.enum([
      'product_sale',
      'service_w2',
      'service_1099',
      'service_llc',
      'investment',
      'other',
    ]),
    billingType: z.enum(['hourly', 'project', 'salary']).optional(),
    hoursWorked: z.coerce.number().positive().optional(),
    wagePerHour: z.coerce.number().positive().optional(),
    overtimeHours: z.coerce.number().min(0).optional(),
    overtimeWagePerHour: z.coerce.number().positive().optional(),
    grossAmount: z.coerce.number().positive().optional(),
    taxesWithheld: z.coerce.number().min(0).optional(),
    taxBreakdown: z.record(z.number()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.billingType === 'hourly' && !data.wagePerHour) {
      ctx.addIssue({
        path: ['wagePerHour'],
        code: z.ZodIssueCode.custom,
        message: 'Wage per hour is required for hourly billing',
      })
    }
    if (data.billingType === 'hourly' && !data.hoursWorked) {
      ctx.addIssue({
        path: ['hoursWorked'],
        code: z.ZodIssueCode.custom,
        message: 'Hours worked is required for hourly billing',
      })
    }
  })

// ── Expense details ───────────────────────────────────────────────────────────
export const expenseDetailsSchema = z.object({
  salesTax: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(1).optional(),
  receiptUrl: z.string().url().optional().or(z.literal('')),
  isDeductible: z.boolean().default(false),
  deductionCategory: z.string().max(100).optional(),
})

export type IncomeDetailsFormData = z.infer<typeof incomeDetailsSchema>
export type ExpenseDetailsFormData = z.infer<typeof expenseDetailsSchema>

// ── Base transaction (legacy – kept for backwards compat) ─────────────────────
export const insertTransactionSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  categoryId: z.string().nullable().optional(),
  payee: z.string(),
  amount: z.number(),
  notes: z.string().nullable().optional(),
  type: z.enum(['income', 'expense']).default('expense'),
})

export const transactionFormSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  categoryId: z.string().uuid().optional(),
  payee: z.string(),
  amount: z.string(),
  notes: z.string().max(255).optional(),
  type: z.enum(['income', 'expense']).default('expense'),
})

// ── Unified create schema (used by server action) ─────────────────────────────
export const CreateTransactionSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().uuid().optional(),
  payee: z.string().min(1, 'Payee is required'),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive'),
  notes: z.string().max(255).optional(),
  type: z.enum(['income', 'expense']),
})

export const UpdateTransactionSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  accountId: z.string(),
  categoryId: z.string().uuid().optional(),
  payee: z.string().min(1, 'Payee is required'),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive'),
  notes: z.string().max(255).optional(),
  type: z.enum(['income', 'expense']),
})

// ── Budget schemas ────────────────────────────────────────────────────────────

export const BudgetGroupTypeEnum = z.enum([
  'income',
  'bills',
  'variable_expenses',
  'debt',
  'savings',
  'investments',
])

export const CreateBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(255),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
})

export const UpdateBudgetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Budget name is required').max(255).optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).optional(),
})

export const CreateBudgetGroupSchema = z.object({
  budgetId: z.string().uuid(),
  name: z.string().min(1, 'Group name is required').max(255),
  type: BudgetGroupTypeEnum,
  sortOrder: z.number().int().min(0).default(0),
})

export const CreateBudgetItemSchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().min(1, 'Item name is required').max(255),
  plannedAmount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0, 'Amount must be zero or positive'),
  categoryId: z.string().uuid().optional().nullable(),
})

export const UpdateBudgetItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Item name is required').max(255).optional(),
  plannedAmount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0)
    .optional(),
  categoryId: z.string().uuid().optional().nullable(),
})

export type CreateBudgetValues = z.infer<typeof CreateBudgetSchema>
export type UpdateBudgetValues = z.infer<typeof UpdateBudgetSchema>
export type CreateBudgetGroupValues = z.infer<typeof CreateBudgetGroupSchema>
export type CreateBudgetItemValues = z.infer<typeof CreateBudgetItemSchema>
export type UpdateBudgetItemValues = z.infer<typeof UpdateBudgetItemSchema>
export type BudgetGroupType = z.infer<typeof BudgetGroupTypeEnum>
