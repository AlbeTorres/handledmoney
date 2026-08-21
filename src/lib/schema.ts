import * as z from 'zod'

export const TwoFactorSchema = z.object({
  code: z.string().min(1, 'Code is required'),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean(),
})
export const ResetSchema = z.object({
  email: z.string().email(),
})
export const ChangePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/[0-9]/, 'At least one number')
    .regex(/[^A-Za-z0-9]/, 'At least one special character'),
})
export const UpdatePersonalInfoSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name is too long' }),
  email: z.string().email({ message: 'Invalid email address' }),
})

export const SettingsPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'At least one uppercase letter')
      .regex(/[0-9]/, 'At least one number')
      .regex(/[^A-Za-z0-9]/, 'At least one special character'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  })

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/[0-9]/, 'At least one number')
    .regex(/[^A-Za-z0-9]/, 'At least one special character'),
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

export const BudgetCalculationTypeEnum = z.enum(['income', 'outflow'])

const endDateOnOrAfterStartDate = (
  value: { startDate: Date; endDate?: Date | null },
  ctx: z.RefinementCtx,
) => {
  if (value.endDate && value.endDate < value.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'End date must be on or after start date',
    })
  }
}

const budgetMetadataShape = {
  name: z.string().min(1, 'Budget name is required').max(255).trim(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
}

export const BudgetMetadataSchema = z
  .object(budgetMetadataShape)
  .superRefine(endDateOnOrAfterStartDate)

export const BudgetPlanItemSchema = z.object({
  categoryId: z.string().uuid('Select a category'),
  plannedAmount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0, 'Amount must be zero or positive'),
})

export const BudgetPlanGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(255).trim(),
  calculationType: BudgetCalculationTypeEnum,
  sortOrder: z.number().int().min(0),
  items: z.array(BudgetPlanItemSchema),
})

export const BudgetStructureSchema = z
  .array(BudgetPlanGroupSchema)
  .min(1, 'Add at least one group')
  .superRefine((groups, ctx) => {
    const hasIncomeGroupWithCategory = groups.some(
      group => group.calculationType === 'income' && group.items.length > 0,
    )
    if (!hasIncomeGroupWithCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['groups'],
        message: 'Add at least one income group with a category',
      })
    }

    const seen = new Set<string>()
    groups.forEach((group, groupIndex) => {
      group.items.forEach((item, itemIndex) => {
        if (seen.has(item.categoryId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['groups', groupIndex, 'items', itemIndex, 'categoryId'],
            message: `Category can only be used once per budget (${item.categoryId})`,
          })
        } else {
          seen.add(item.categoryId)
        }
      })
    })
  })

export const CreateBudgetSchema = z
  .object({
    ...budgetMetadataShape,
    groups: BudgetStructureSchema,
  })
  .superRefine(endDateOnOrAfterStartDate)
  .superRefine((value, ctx) => {
    const totalIncome = value.groups
      .filter(group => group.calculationType === 'income')
      .reduce(
        (sum, group) =>
          sum + group.items.reduce((itemSum, item) => itemSum + item.plannedAmount, 0),
        0,
      )
    if (totalIncome <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['groups'],
        message: 'Planned income must be greater than zero',
      })
    }
  })

export const UpdateBudgetSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Budget name is required').max(255).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be on or after start date',
      })
    }
  })

export const CreateBudgetGroupSchema = z.object({
  budgetId: z.string().uuid(),
  name: z.string().min(1, 'Group name is required').max(255),
  calculationType: BudgetCalculationTypeEnum,
  sortOrder: z.number().int().min(0).default(0),
})

export const DuplicateBudgetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Budget name is required').max(255).optional(),
  startDate: z.coerce.date(),
})

export const UpdateBudgetGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Group name is required').max(255),
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

const monthlyPeriodSchema = z
  .object({
    mode: z.literal('monthly'),
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(0).max(11),
  })
  .strict()

/**
 * Annual reporting period. Forbids `month`; only `year` is meaningful.
 */
const annualPeriodSchema = z
  .object({
    mode: z.literal('annual'),
    year: z.number().int().min(2000).max(2100),
  })
  .strict()

/**
 * Runtime contract for a dashboard reporting period. The discriminated union
 * guarantees monthly periods carry a `month` and annual periods never do.
 * `.strict()` rejects unknown keys and out-of-range years.
 */
export const DashboardPeriodSchema = z.discriminatedUnion('mode', [
  monthlyPeriodSchema,
  annualPeriodSchema,
])

export type DashboardPeriod = z.infer<typeof DashboardPeriodSchema>

export type CreateBudgetValues = z.infer<typeof CreateBudgetSchema>
export type UpdateBudgetValues = z.infer<typeof UpdateBudgetSchema>
export type CreateBudgetGroupValues = z.infer<typeof CreateBudgetGroupSchema>
export type CreateBudgetItemValues = z.infer<typeof CreateBudgetItemSchema>
export type UpdateBudgetItemValues = z.infer<typeof UpdateBudgetItemSchema>
export type BudgetCalculationType = z.infer<typeof BudgetCalculationTypeEnum>
