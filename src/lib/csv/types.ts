import type { CSVTransaction } from '@/interfaces'

/**
 * Type resolution mode for the import (M0.2).
 * - 'auto': derive from the amount sign (default).
 * - 'all_expenses' / 'all_income': force every row to the given type.
 * - 'map': read the mapped type column, using the vocabulary from constants.ts.
 */
export type TypeMode = 'auto' | 'all_expenses' | 'all_income' | 'map'

/** Date part order used when reading raw date strings (M0.3). */
export type DateOrder = 'dd/mm' | 'mm/dd'

/** Manual number format for amount parsing (M0.8). */
export type NumberFormat = 'us' | 'eu'

/** Header-level import configuration, driven by the ImportCard controls. */
export interface ImportConfig {
  /** Selected account id; '' means not selected yet (CSV-IMP-01). */
  accountId: string
  /** Type resolution mode (M0.2). */
  typeMode: TypeMode
  /**
   * Resolved date order; null when not yet resolved (auto-detect/selector, M0.3).
   * normalizeRows falls back to 'mm/dd' when null (en default).
   */
  dateOrder: DateOrder | null
  /** Manual number format; defaults to US (M0.8). */
  numberFormat: NumberFormat
}

/**
 * A normalized, reviewable row. Single source of truth shared by the review
 * preview and the submit payload (CSV-IMP-11).
 */
export interface NormalizedRow {
  accountId: string
  payee: string
  notes: string
  /** 'YYYY-MM-DD' date-only — never a Date here (M0.3, no UTC off-by-one). */
  date: string
  /** Always positive; polarity is carried by `type` (CSV-IMP-05). */
  amount: number
  type: 'expense' | 'income'
  /** True when another row shares account + date + amount + payee (M0.4). */
  possibleDuplicate: boolean
  /** True when the row has no payee (M0.7). */
  payeeMissing: boolean
  /** True when the mapped type conflicts with the amount sign (M0.2). */
  typeConflict: boolean
  /** True when the user excluded this row from the submit payload (D6). */
  excluded: boolean
}

/**
 * Per-row error report entry (CSV-IMP-09). `rowIndex` is 0-based over the
 * submitted (post-exclusion) rows; the UI displays rowIndex + 1.
 */
export interface RowError {
  rowIndex: number
  field: string
  reason: string
}

/**
 * Payload submitted to the bulk action (D2): one account for the whole file
 * plus the normalized rows; the server injects accountId per row (M0.1).
 */
export interface BulkImportInput {
  accountId: string
  rows: CSVTransaction[]
}
