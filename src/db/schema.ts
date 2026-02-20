import { relations } from 'drizzle-orm'
import {
  bigint,
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['admin', 'user'])

export const languageEnum = pgEnum('language', ['es', 'en'])

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

export const Settings = pgTable('settings', {
  id: text('id').primaryKey(),
  userId: text()
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  language: languageEnum().default('en'),
})

export const bankAccountsTable = pgTable('bank_account', {
  id: text('id').primaryKey(),
  plaidId: varchar({ length: 255 }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: varchar({ length: 255 }).notNull(),
})

export const categoriesTable = pgTable('category', {
  id: text('id').primaryKey(),
  plaidId: varchar({ length: 255 }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: varchar({ length: 255 }).notNull(),
})

export const transactionsTable = pgTable('transaction', {
  id: text('id').primaryKey(),

  amount: bigint({ mode: 'bigint' }).notNull(),

  payee: varchar({ length: 255 }),
  notes: varchar({ length: 255 }),

  date: timestamp().notNull(),

  accountId: text()
    .notNull()
    .references(() => bankAccountsTable.id, { onDelete: 'cascade' }),

  categoryId: text().references(() => categoriesTable.id),

  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

//relations

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),

  bankAccounts: many(bankAccountsTable),
  categories: many(categoriesTable),
  transactions: many(transactionsTable),

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
}))
