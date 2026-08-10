import type { TypeMode } from './types'

/**
 * Maximum number of rows a single file import accepts (D8).
 * Enforced client-side and server-side to keep the review table and the
 * server action responsive. V1 sanity limit only.
 */
export const MAX_IMPORT_ROWS = 1000

/**
 * Selectable type-resolution modes for the ImportCard header (M0.2).
 * `labelKey` is the full key path under the single `handledmoney.transaction`
 * translations hook, e.g. t('import.type_mode_auto') (one-hook rule).
 * The message strings land in messages/*.json in Phase 4.
 */
export const TYPE_OPTIONS: { value: TypeMode; labelKey: string }[] = [
  { value: 'auto', labelKey: 'import.type_mode_auto' },
  { value: 'all_expenses', labelKey: 'import.type_mode_all_expenses' },
  { value: 'all_income', labelKey: 'import.type_mode_all_income' },
  { value: 'map', labelKey: 'import.type_mode_map' },
]

/**
 * Case-insensitive vocabulary for a mapped type column (M0.2):
 * DEBIT|CREDIT, D|C, +|-, expense|income, DSLIP→income.
 * Lookup with trimmed, uppercased values (see resolveMappedType in normalize.ts).
 */
export const MAPPED_TYPE_VOCABULARY: Record<string, 'expense' | 'income'> = {
  DEBIT: 'expense',
  D: 'expense',
  '-': 'expense',
  EXPENSE: 'expense',
  CREDIT: 'income',
  C: 'income',
  '+': 'income',
  INCOME: 'income',
  DSLIP: 'income',
}
