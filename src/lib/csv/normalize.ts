import { MAPPED_TYPE_VOCABULARY } from './constants'
import type {
  DateOrder,
  ImportConfig,
  NormalizedRow,
  NumberFormat,
  TypeMode,
} from './types'

/**
 * Parses a raw amount cell into a number according to the manual format
 * selector (M0.8). Strips currency symbols; keeps the sign so the caller can
 * derive polarity (CSV-IMP-05).
 *
 * - us: `1,234.56` (thousands comma, decimal dot)
 * - eu: `1.234,56` (thousands dot, decimal comma)
 *
 * Returns NaN for unparseable input. Accounting negatives `(1.234,56)` are a
 * documented V1 limit and are NOT supported.
 */
export function normalizeAmount(raw: string, format: NumberFormat): number {
  const cleaned = raw.trim().replace(/[$€£¥\s]/g, '')
  if (cleaned === '') return NaN

  const normalized =
    format === 'eu'
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/,/g, '')

  const value = Number(normalized)
  return Number.isFinite(value) ? value : NaN
}

/**
 * Auto-detects the date part order from sample values (M0.3):
 * first part > 12 → dd/mm; second part > 12 → mm/dd; otherwise 'ambiguous'.
 * Keeps scanning until a decisive sample is found. ISO (year-first) values
 * resolve to 'mm/dd' — the order is irrelevant because normalizeDate passes
 * ISO values through unchanged.
 */
export function detectDateOrder(samples: string[]): DateOrder | 'ambiguous' {
  for (const raw of samples) {
    const trimmed = raw.trim()
    if (trimmed === '') continue

    if (/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.test(trimmed)) {
      return 'mm/dd'
    }

    const parts = trimmed.split(/[-/.]/)
    if (parts.length !== 3) continue

    const first = Number(parts[0])
    const second = Number(parts[1])
    if (Number.isNaN(first) || Number.isNaN(second)) continue

    if (first > 12) return 'dd/mm'
    if (second > 12) return 'mm/dd'
    // ambiguous sample — keep scanning; 'ambiguous' only if none is decisive
  }
  return 'ambiguous'
}

/**
 * Normalizes a raw date cell to 'YYYY-MM-DD' (M0.3). Splits the parts and
 * reorders them — NEVER `new Date(raw)` (UTC midnight → off-by-one).
 *
 * - ISO values (`2024-01-24` / `2024/1/24`) pass through unchanged.
 * - Unparseable input and 2-digit years (`1/1/24`, documented V1 limit) are
 *   passed through unchanged so the review still shows the raw value and the
 *   backend can report the row.
 */
export function normalizeDate(raw: string, order: DateOrder): string {
  const trimmed = raw.trim()
  if (trimmed === '') return ''

  const iso = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (iso) {
    return `${iso[1]}-${pad2(iso[2])}-${pad2(iso[3])}`
  }

  const parts = trimmed.split(/[-/.]/)
  if (parts.length !== 3) return trimmed

  const [first, second, third] = parts
  if (!/^\d{4}$/.test(third)) return trimmed // 2-digit years not supported (V1)

  const day = order === 'dd/mm' ? first : second
  const month = order === 'dd/mm' ? second : first
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month)) return trimmed

  return `${third}-${pad2(month)}-${pad2(day)}`
}

/**
 * Resolves the row type per the file's type mode (M0.2).
 *
 * - 'all_expenses' / 'all_income': forced type, never a conflict.
 * - 'map': the mapped column value wins over the sign (case-insensitive
 *   vocabulary); a recognized mapped type that contradicts an explicit sign
 *   sets `conflict: true` — never silently choose. An unrecognized mapped
 *   value falls back to the sign, then to 'expense'.
 * - 'auto': derive from the sign; an unsigned positive amount reads as
 *   'income'. The CSV-IMP-04 all-positive → expense default lives in
 *   normalizeRows, where the whole file is known.
 */
export function detectType(input: {
  mode: TypeMode
  mappedValue: string | null
  rawAmount: string
}): { type: 'expense' | 'income'; conflict: boolean } {
  const { mode, mappedValue, rawAmount } = input

  if (mode === 'all_expenses') return { type: 'expense', conflict: false }
  if (mode === 'all_income') return { type: 'income', conflict: false }

  const signType = signTypeOf(rawAmount)

  if (mode === 'map') {
    const mapped = resolveMappedType(mappedValue)
    if (mapped) {
      return {
        type: mapped,
        conflict: signType !== null && signType !== mapped,
      }
    }
    // Unrecognized or empty mapped value → fall back to the sign.
    return { type: signType ?? 'expense', conflict: false }
  }

  // mode === 'auto'
  return { type: signType ?? 'income', conflict: false }
}

/**
 * Maps a raw type-column value to expense/income via the vocabulary,
 * or null when the value is empty or unrecognized.
 */
export function resolveMappedType(
  value: string | null | undefined,
): 'expense' | 'income' | null {
  if (value == null) return null
  return MAPPED_TYPE_VOCABULARY[value.trim().toUpperCase()] ?? null
}

/**
 * Builds the normalized rows for review from the mapped raw rows
 * (CSV-IMP-04/05/06/11). `mappedRows` are objects keyed by target column
 * ('amount' | 'date' | 'payee' | 'notes' | 'type').
 *
 * CSV-IMP-04: in auto mode without a mapped type column, a file with no
 * explicitly signed amount has no polarity to detect → every row defaults to
 * 'expense' (expense-tracking exports are the common migration case).
 *
 * Keeps a 1:1 mapping with the source order so the review rows shown are
 * exactly the rows submitted (CSV-IMP-08/11).
 */
export function normalizeRows(
  mappedRows: Record<string, string>[],
  config: ImportConfig,
  hasTypeColumn: boolean,
): NormalizedRow[] {
  const allUnsigned = mappedRows.every(row => !hasExplicitSign(row['amount'] ?? ''))
  const defaultExpense = config.typeMode === 'auto' && !hasTypeColumn && allUnsigned

  return mappedRows.map(row => {
    const rawAmount = row['amount'] ?? ''
    const resolved = defaultExpense
      ? { type: 'expense' as const, conflict: false }
      : detectType({
          mode: config.typeMode,
          mappedValue: row['type'] ?? null,
          rawAmount,
        })
    const payee = (row['payee'] ?? '').trim()
    const notes = (row['notes'] ?? '').trim()

    return {
      accountId: config.accountId,
      payee,
      notes,
      date: normalizeDate(row['date'] ?? '', config.dateOrder ?? 'mm/dd'),
      amount: Math.abs(normalizeAmount(rawAmount, config.numberFormat)),
      type: resolved.type,
      possibleDuplicate: false,
      payeeMissing: payee === '',
      typeConflict: resolved.conflict,
      excluded: false,
    }
  })
}

function pad2(value: string): string {
  return value.length === 1 ? `0${value}` : value
}

/** Explicit-sign polarity: negative → expense, positive → income, none → null. */
function signTypeOf(rawAmount: string): 'expense' | 'income' | null {
  const trimmed = rawAmount.trim()
  if (trimmed === '') return null
  const value = Number(trimmed.replace(/[$€£¥\s]/g, ''))
  if (Number.isNaN(value) || value === 0) return null
  return value < 0 ? 'expense' : 'income'
}

/** True when the raw amount carries an explicit '+' or '-' prefix. */
function hasExplicitSign(raw: string): boolean {
  const trimmed = raw.trim()
  return trimmed.startsWith('+') || trimmed.startsWith('-')
}
