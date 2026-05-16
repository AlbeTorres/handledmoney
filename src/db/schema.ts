import { relations } from 'drizzle-orm'
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['admin', 'user'])

export const languageEnum = pgEnum('language', ['es', 'en'])

export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense'])

export const incomeTypeEnum = pgEnum('income_type', [
  'product_sale',
  'service_w2',
  'service_1099',
  'service_llc',
  'investment',
  'other',
])

export const billingTypeEnum = pgEnum('billing_type', ['hourly', 'project', 'salary'])

export const budgetGroupTypeEnum = pgEnum('budget_group_type', [
  'income',
  'bills',
  'variable_expenses',
  'debt',
  'savings',
  'investments',
])

const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at'),
}

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: roleEnum().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  table => [index('session_userId_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [index('account_userId_idx').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [index('verification_identifier_idx').on(table.identifier)],
)

export const twoFactor = pgTable(
  'two_factor',
  {
    id: text('id').primaryKey(),
    secret: text('secret').notNull(),
    backupCodes: text('backup_codes').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  table => [
    index('twoFactor_secret_idx').on(table.secret),
    index('twoFactor_userId_idx').on(table.userId),
  ],
)

export const Settings = pgTable('settings', {
  id: text('id').primaryKey(),
  userId: text()
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  language: languageEnum().default('en'),
  ...timestamps,
})

export const bankAccountsTable = pgTable('bank_account', {
  id: uuid('id').defaultRandom().primaryKey(),
  plaidId: varchar({ length: 255 }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: varchar({ length: 255 }).notNull(),
  bank: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 255 }).notNull(),
  currency: varchar({ length: 255 }).default('USD').notNull(),
  balance: numeric('balance', { precision: 10, scale: 2 }).default('0').notNull(),
  icon: varchar({ length: 255 }).notNull(),
  color: varchar({ length: 255 }).notNull(),

  transactionsCount: integer('transactions_count').default(0).notNull(),
  ...timestamps,
})

export const categoriesTable = pgTable('category', {
  id: uuid('id').defaultRandom().primaryKey(),
  plaidId: varchar({ length: 255 }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: varchar({ length: 255 }).notNull(),
  icon: varchar({ length: 100 }),
  color: varchar({ length: 7 }),
  type: categoryTypeEnum().default('expense').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  order: integer('order').default(0).notNull(),
  ...timestamps,
})

export const transactionsTable = pgTable(
  'transaction',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    amount: numeric('amount', { precision: 10, scale: 2 }).default('0'),
    payee: varchar({ length: 255 }).notNull(),
    notes: varchar({ length: 255 }),
    date: timestamp().notNull(),
    accountId: uuid()
      .notNull()
      .references(() => bankAccountsTable.id, { onDelete: 'cascade' }),
    categoryId: uuid().references(() => categoriesTable.id),
    type: categoryTypeEnum().default('expense').notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  table => [index('transaction_userId_type_date_idx').on(table.userId, table.type, table.date)],
)

export const incomeDetailsTable = pgTable('income_details', {
  id: uuid('id').defaultRandom().primaryKey(),

  transactionId: uuid('transaction_id')
    .notNull()
    .unique()
    .references(() => transactionsTable.id, { onDelete: 'cascade' }),

  incomeType: incomeTypeEnum('income_type').notNull(),
  billingType: billingTypeEnum('billing_type'),

  // Hourly-billing fields
  hoursWorked: numeric('hours_worked', { precision: 6, scale: 2 }),
  wagePerHour: numeric('wage_per_hour', { precision: 10, scale: 2 }),
  overtimeHours: numeric('overtime_hours', { precision: 6, scale: 2 }),
  overtimeWagePerHour: numeric('overtime_wage_per_hour', { precision: 10, scale: 2 }),

  // Tax breakdown — { federal: 0.22, state: 0.05, fica: 0.062, medicare: 0.0145 }
  taxBreakdown: jsonb('tax_breakdown'),

  grossAmount: numeric('gross_amount', { precision: 10, scale: 2 }),
  taxesWithheld: numeric('taxes_withheld', { precision: 10, scale: 2 }),

  ...timestamps,
})

export const expenseDetailsTable = pgTable('expense_details', {
  id: uuid('id').defaultRandom().primaryKey(),

  transactionId: uuid('transaction_id')
    .notNull()
    .unique()
    .references(() => transactionsTable.id, { onDelete: 'cascade' }),

  salesTax: numeric('sales_tax', { precision: 10, scale: 2 }).default('0'),
  taxRate: numeric('tax_rate', { precision: 5, scale: 4 }), // e.g. 0.0725 = 7.25%

  receiptUrl: text('receipt_url'),
  receiptHash: text('receipt_hash'), // duplicate detection

  isDeductible: boolean('is_deductible').default(false),
  deductionCategory: varchar({ length: 100 }),

  ...timestamps,
})

// ── Budget tables ─────────────────────────────────────────────────────────────

export const budgetsTable = pgTable(
  'budget',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: varchar({ length: 255 }).notNull(),
    month: integer('month').notNull(), // 1–12
    year: integer('year').notNull(),
    ...timestamps,
  },
  table => [index('budget_userId_year_month_idx').on(table.userId, table.year, table.month)],
)

export const budgetGroupsTable = pgTable('budget_group', {
  id: uuid('id').defaultRandom().primaryKey(),
  budgetId: uuid('budget_id')
    .notNull()
    .references(() => budgetsTable.id, { onDelete: 'cascade' }),
  name: varchar({ length: 255 }).notNull(),
  type: budgetGroupTypeEnum().notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  ...timestamps,
})

export const budgetItemsTable = pgTable('budget_item', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => budgetGroupsTable.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categoriesTable.id, { onDelete: 'set null' }),
  name: varchar({ length: 255 }).notNull(),
  plannedAmount: numeric('planned_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  ...timestamps,
})

// rate limiter

export const rateLimit = pgTable('rateLimit', {
  id: text('id').primaryKey(),
  key: text('key'), // identifica la IP
  count: integer('count'), // cuántas requests ha hecho
  lastRequest: bigint('last_request', { mode: 'number' }).notNull(),
})

//relations

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),

  bankAccounts: many(bankAccountsTable),
  categories: many(categoriesTable),
  transactions: many(transactionsTable),
  twoFactors: many(twoFactor),
  budgets: many(budgetsTable),

  settings: one(Settings, {
    fields: [user.id],
    references: [Settings.userId],
  }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}))

export const bankAccountsRelations = relations(bankAccountsTable, ({ one, many }) => ({
  user: one(user, {
    fields: [bankAccountsTable.userId],
    references: [user.id],
  }),
  transactions: many(transactionsTable),
}))

export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
  user: one(user, {
    fields: [categoriesTable.userId],
    references: [user.id],
  }),
  transactions: many(transactionsTable),
}))

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  user: one(user, {
    fields: [transactionsTable.userId],
    references: [user.id],
  }),
  account: one(bankAccountsTable, {
    fields: [transactionsTable.accountId],
    references: [bankAccountsTable.id],
  }),
  category: one(categoriesTable, {
    fields: [transactionsTable.categoryId],
    references: [categoriesTable.id],
  }),
  incomeDetails: one(incomeDetailsTable, {
    fields: [transactionsTable.id],
    references: [incomeDetailsTable.transactionId],
  }),
  expenseDetails: one(expenseDetailsTable, {
    fields: [transactionsTable.id],
    references: [expenseDetailsTable.transactionId],
  }),
}))

export const incomeDetailsRelations = relations(incomeDetailsTable, ({ one }) => ({
  transaction: one(transactionsTable, {
    fields: [incomeDetailsTable.transactionId],
    references: [transactionsTable.id],
  }),
}))

export const expenseDetailsRelations = relations(expenseDetailsTable, ({ one }) => ({
  transaction: one(transactionsTable, {
    fields: [expenseDetailsTable.transactionId],
    references: [transactionsTable.id],
  }),
}))

export const budgetsRelations = relations(budgetsTable, ({ one, many }) => ({
  user: one(user, {
    fields: [budgetsTable.userId],
    references: [user.id],
  }),
  groups: many(budgetGroupsTable),
}))

export const budgetGroupsRelations = relations(budgetGroupsTable, ({ one, many }) => ({
  budget: one(budgetsTable, {
    fields: [budgetGroupsTable.budgetId],
    references: [budgetsTable.id],
  }),
  items: many(budgetItemsTable),
}))

export const budgetItemsRelations = relations(budgetItemsTable, ({ one }) => ({
  group: one(budgetGroupsTable, {
    fields: [budgetItemsTable.groupId],
    references: [budgetGroupsTable.id],
  }),
  category: one(categoriesTable, {
    fields: [budgetItemsTable.categoryId],
    references: [categoriesTable.id],
  }),
}))
