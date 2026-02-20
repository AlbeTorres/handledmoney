// import { relations } from 'drizzle-orm'
// import {
//   bigint,
//   boolean,
//   integer,
//   pgEnum,
//   pgTable,
//   primaryKey,
//   timestamp,
//   unique,
//   uuid,
//   varchar,
// } from 'drizzle-orm/pg-core'

// enum Languaje {
//   en = 'en',
//   es = 'es',
// }

// //roles
// export const roleEnum = pgEnum('role', ['admin', 'user'])

// export const languageEnum = pgEnum('language', ['es', 'en'])

// //models
// export const usersTable = pgTable('users', {
//   id: uuid().defaultRandom().primaryKey(),
//   name: varchar({ length: 255 }),
//   email: varchar({ length: 255 }).unique(),
//   emailVerified: timestamp(),
//   password: varchar({ length: 255 }),
//   image: varchar({ length: 255 }),
//   role: roleEnum().default('user'),
//   isTwoFactorEnabled: boolean().default(false),
// })

// export const accountsTable = pgTable(
//   'accounts',
//   {
//     userId: uuid()
//       .notNull()
//       .references(() => usersTable.id, { onDelete: 'cascade' }),
//     type: varchar({ length: 255 }).notNull(),
//     provider: varchar({ length: 255 }).notNull(),
//     providerAccountId: varchar({ length: 255 }).notNull(),
//     refresh_token: varchar({ length: 255 }),
//     access_token: varchar({ length: 255 }),
//     expires_at: integer(),
//     token_type: varchar({ length: 255 }),
//     scope: varchar({ length: 255 }),
//     id_token: varchar({ length: 255 }),
//     session_state: varchar({ length: 255 }),

//     createdAt: timestamp().defaultNow(),
//     updatedAt: timestamp()
//       .defaultNow()
//       .$onUpdate(() => new Date()),
//   },
//   table => [
//     // Primary key compuesto
//     primaryKey({ columns: [table.provider, table.providerAccountId] }),
//   ],
// )

// export const VerificationToken = pgTable(
//   'verification_token',
//   {
//     id: uuid().defaultRandom().primaryKey(),
//     email: varchar({ length: 255 }).notNull(),
//     token: varchar({ length: 255 }).notNull().unique(),
//     expires: timestamp().notNull(),
//   },
//   table => [
//     // unique compuesta equivalente a @@unique([email, token])
//     unique().on(table.email, table.token),
//   ],
// )

// export const PasswordResetToken = pgTable(
//   'password_reset_token',
//   {
//     id: uuid().defaultRandom().primaryKey(),
//     email: varchar({ length: 255 }).notNull(),
//     token: varchar({ length: 255 }).notNull().unique(),
//     expires: timestamp().notNull(),
//   },
//   table => [
//     // unique compuesta equivalente a @@unique([email, token])
//     unique().on(table.email, table.token),
//   ],
// )

// export const TwoFactorToken = pgTable(
//   'two_factor_token',
//   {
//     id: uuid().defaultRandom().primaryKey(),
//     email: varchar({ length: 255 }).notNull(),
//     token: varchar({ length: 255 }).notNull().unique(),
//     expires: timestamp().notNull(),
//   },
//   table => [
//     // unique compuesta equivalente a @@unique([email, token])
//     unique().on(table.email, table.token),
//   ],
// )

// export const TwoFactorConfirmation = pgTable('two_factor_confirmation', {
//   id: uuid().defaultRandom().primaryKey(),
//   userId: uuid()
//     .notNull()
//     .unique()
//     .references(() => usersTable.id, { onDelete: 'cascade' }),
// })

// export const Settings = pgTable('settings', {
//   id: uuid().defaultRandom().primaryKey(),
//   userId: uuid()
//     .notNull()
//     .unique()
//     .references(() => usersTable.id, { onDelete: 'cascade' }),
//   language: languageEnum().default('en'),
// })

// export const bankAccountsTable = pgTable('bank_account', {
//   id: uuid().defaultRandom().primaryKey(),
//   plaidId: varchar({ length: 255 }),
//   userId: uuid()
//     .notNull()
//     .references(() => usersTable.id, { onDelete: 'cascade' }),
//   name: varchar({ length: 255 }).notNull(),
// })

// export const categoriesTable = pgTable('category', {
//   id: uuid().defaultRandom().primaryKey(),
//   plaidId: varchar({ length: 255 }),
//   userId: uuid()
//     .notNull()
//     .references(() => usersTable.id, { onDelete: 'cascade' }),
//   name: varchar({ length: 255 }).notNull(),
// })

// export const transactionsTable = pgTable('transaction', {
//   id: uuid().defaultRandom().primaryKey(),

//   amount: bigint({ mode: 'bigint' }).notNull(),

//   payee: varchar({ length: 255 }),
//   notes: varchar({ length: 255 }),

//   date: timestamp().notNull(),

//   accountId: uuid()
//     .notNull()
//     .references(() => bankAccountsTable.id, { onDelete: 'cascade' }),

//   categoryId: uuid().references(() => categoriesTable.id),

//   userId: uuid()
//     .notNull()
//     .references(() => usersTable.id, { onDelete: 'cascade' }),
// })

// //relations
// export const usersRelations = relations(usersTable, ({ many, one }) => ({
//   account: many(accountsTable),
//   bankAccounts: many(bankAccountsTable),
//   categories: many(categoriesTable),
//   transactions: many(transactionsTable),

//   twoFactorConfirmation: one(TwoFactorConfirmation, {
//     fields: [usersTable.id],
//     references: [TwoFactorConfirmation.userId],
//   }),

//   settings: one(Settings, {
//     fields: [usersTable.id],
//     references: [Settings.userId],
//   }),
// }))

// export const accountsRelations = relations(accountsTable, ({ one }) => ({
//   user: one(usersTable, {
//     fields: [accountsTable.userId],
//     references: [usersTable.id],
//   }),
// }))

// export const settingsRelations = relations(Settings, ({ one }) => ({
//   user: one(usersTable, {
//     fields: [Settings.userId],
//     references: [usersTable.id],
//   }),
// }))

// export const bankAccountsRelations = relations(bankAccountsTable, ({ one, many }) => ({
//   user: one(usersTable, {
//     fields: [bankAccountsTable.userId],
//     references: [usersTable.id],
//   }),
//   transactions: many(transactionsTable),
// }))

// export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
//   user: one(usersTable, {
//     fields: [categoriesTable.userId],
//     references: [usersTable.id],
//   }),
//   transactions: many(transactionsTable),
// }))

// export const twoFactorConfirmationRelations = relations(TwoFactorConfirmation, ({ one }) => ({
//   user: one(usersTable, {
//     fields: [TwoFactorConfirmation.userId],
//     references: [usersTable.id],
//   }),
// }))

// export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
//   user: one(usersTable, {
//     fields: [transactionsTable.userId],
//     references: [usersTable.id],
//   }),
//   account: one(bankAccountsTable, {
//     fields: [transactionsTable.accountId],
//     references: [bankAccountsTable.id],
//   }),
//   category: one(categoriesTable, {
//     fields: [transactionsTable.categoryId],
//     references: [categoriesTable.id],
//   }),
// }))
