import { describe, expect, it } from 'vitest'
import { cleanCsvRows } from '@/lib/csv/clean'
import { findDuplicateCandidates } from '@/lib/csv/duplicates'
import {
  detectDateOrder,
  detectType,
  normalizeAmount,
  normalizeDate,
  normalizeRows,
} from '@/lib/csv/normalize'
import type { ImportConfig, NormalizedRow } from '@/lib/csv/types'

// ── Fixtures (spec "Test Fixtures") ───────────────────────────────────────────

// Fixture CSV 1 — expense-app export: MM/DD dates, all-positive, no type
// column, trailing empties, three legit duplicate $3.49 Rebtel rows.
const CSV1_RAW = [
  ['Date', 'Description', 'Category', 'Amount', 'Year', 'Month', 'Day', '', '', ''],
  ['1/24/2024', 'Rebtel', 'Phone', '$3.49', '2024', '1', '24', '', '', ''],
  ['1/24/2024', 'Rebtel', 'Phone', '$3.49', '2024', '1', '24', '', '', ''],
  ['1/24/2024', 'Rebtel', 'Phone', '$3.49', '2024', '1', '24', '', '', ''],
  ['1/25/2024', 'Opening balance', 'General', '$100.00', '2024', '1', '25', '', '', ''],
]

// Fixture CSV 2 — bank statement: Details DEBIT/CREDIT/DSLIP, ambiguous date,
// signed amounts, bank Type codes (DR/CR/DP).
const CSV2_RAW = [
  ['Details', 'Posting Date', 'Description', 'Amount', 'Type', 'Balance', 'Check or Slip #'],
  ['DEBIT', '08/10/2026', 'Grocery Store', '-120.50', 'DR', '1879.50', ''],
  ['CREDIT', '08/10/2026', 'Client Payment', '+2000.00', 'CR', '3879.50', ''],
  ['DSLIP', '08/10/2026', 'Cash Deposit', '500.00', 'DP', '4379.50', ''],
]

// Mapped rows: target column → raw cell (what ImportCard produces in Phase 2).
const CSV1_MAPPED: Record<string, string>[] = [
  { date: '1/24/2024', payee: 'Rebtel', amount: '$3.49' },
  { date: '1/24/2024', payee: 'Rebtel', amount: '$3.49' },
  { date: '1/24/2024', payee: 'Rebtel', amount: '$3.49' },
  { date: '1/25/2024', payee: 'Opening balance', amount: '$100.00' },
]

const CSV2_MAPPED: Record<string, string>[] = [
  { type: 'DEBIT', date: '08/10/2026', payee: 'Grocery Store', amount: '-120.50' },
  { type: 'CREDIT', date: '08/10/2026', payee: 'Client Payment', amount: '+2000.00' },
  { type: 'DSLIP', date: '08/10/2026', payee: 'Cash Deposit', amount: '500.00' },
]

const makeRow = (overrides: Partial<NormalizedRow> = {}): NormalizedRow => ({
  accountId: 'acc-1',
  payee: 'Rebtel',
  notes: '',
  date: '2024-01-24',
  amount: 3.49,
  type: 'expense',
  possibleDuplicate: false,
  payeeMissing: false,
  typeConflict: false,
  excluded: false,
  ...overrides,
})

// ── cleanCsvRows (CSV-IMP-07) ─────────────────────────────────────────────────

describe('cleanCsvRows', () => {
  it('filters trailing empty columns (CSV 1 fixtures end with ,,,)', () => {
    const cleaned = cleanCsvRows(CSV1_RAW)
    expect(cleaned).toHaveLength(5) // header + 4 rows
    expect(cleaned[0]).toEqual(['Date', 'Description', 'Category', 'Amount', 'Year', 'Month', 'Day'])
    expect(cleaned[1]).toEqual(['1/24/2024', 'Rebtel', 'Phone', '$3.49', '2024', '1', '24'])
  })

  it('filters the trailing empty Check or Slip # column in CSV 2 (defect 11)', () => {
    const cleaned = cleanCsvRows(CSV2_RAW)
    expect(cleaned[1]).toEqual(['DEBIT', '08/10/2026', 'Grocery Store', '-120.50', 'DR', '1879.50'])
    expect(cleaned[2]).toEqual(['CREDIT', '08/10/2026', 'Client Payment', '+2000.00', 'CR', '3879.50'])
    expect(cleaned[3]).toEqual(['DSLIP', '08/10/2026', 'Cash Deposit', '500.00', 'DP', '4379.50'])
  })

  it('drops fully empty rows', () => {
    const dirty = [
      ['Date', 'Amount'],
      ['', ''],
      ['1/24/2024', '3.49'],
      ['', ''],
    ]
    const cleaned = cleanCsvRows(dirty)
    expect(cleaned).toEqual([
      ['Date', 'Amount'],
      ['1/24/2024', '3.49'],
    ])
  })

  it('returns an empty array for an empty input', () => {
    expect(cleanCsvRows([])).toEqual([])
  })
})

// ── normalizeAmount (CSV-IMP-05, M0.8) ────────────────────────────────────────

describe('normalizeAmount', () => {
  it('parses US format with thousands separators', () => {
    expect(normalizeAmount('1,234.56', 'us')).toBe(1234.56)
  })

  it('parses EU format (1.234,56 → 1234.56)', () => {
    expect(normalizeAmount('1.234,56', 'eu')).toBe(1234.56)
  })

  it('parses EU format without thousands (100,00 → 100)', () => {
    expect(normalizeAmount('100,00', 'eu')).toBe(100)
  })

  it('strips currency symbols ($100.00 → 100, CSV 1)', () => {
    expect(normalizeAmount('$100.00', 'us')).toBe(100)
    expect(normalizeAmount('€1.234,56', 'eu')).toBe(1234.56)
  })

  it('keeps the sign so polarity can be derived (-25.00 stays -25)', () => {
    expect(normalizeAmount('-25.00', 'us')).toBe(-25)
    expect(normalizeAmount('+2000.00', 'us')).toBe(2000)
  })

  it('returns NaN for unparseable input', () => {
    expect(normalizeAmount('abc', 'us')).toBeNaN()
    expect(normalizeAmount('', 'us')).toBeNaN()
  })
})

// ── detectDateOrder (CSV-IMP-06, M0.3) ────────────────────────────────────────

describe('detectDateOrder', () => {
  it('detects MM/DD when the second part > 12 (CSV 1: 1/24/2024)', () => {
    expect(detectDateOrder(['1/24/2024'])).toBe('mm/dd')
  })

  it('detects DD/MM when the first part > 12', () => {
    expect(detectDateOrder(['24/01/2024'])).toBe('dd/mm')
  })

  it('returns ambiguous when both parts are <= 12 (CSV 2: 08/10/2026)', () => {
    expect(detectDateOrder(['08/10/2026'])).toBe('ambiguous')
  })

  it('keeps scanning past ambiguous samples for a decisive one', () => {
    expect(detectDateOrder(['01/02/2024', '25/03/2024'])).toBe('dd/mm')
  })

  it('resolves ISO values to mm/dd (order irrelevant, passthrough)', () => {
    expect(detectDateOrder(['2024-01-24'])).toBe('mm/dd')
  })

  it('returns ambiguous for empty or unparseable samples', () => {
    expect(detectDateOrder([])).toBe('ambiguous')
    expect(detectDateOrder(['', 'n/a'])).toBe('ambiguous')
  })
})

// ── normalizeDate (CSV-IMP-06, M0.3) ──────────────────────────────────────────

describe('normalizeDate', () => {
  it('normalizes 1/24/2024 as MM/DD to 2024-01-24 (CSV 1)', () => {
    expect(normalizeDate('1/24/2024', 'mm/dd')).toBe('2024-01-24')
  })

  it('normalizes 08/10/2026 by locale bias: MM/DD → 2026-08-10, DD/MM → 2026-10-08 (CSV 2)', () => {
    expect(normalizeDate('08/10/2026', 'mm/dd')).toBe('2026-08-10')
    expect(normalizeDate('08/10/2026', 'dd/mm')).toBe('2026-10-08')
  })

  it('normalizes 24/01/2024 as DD/MM to 2024-01-24', () => {
    expect(normalizeDate('24/01/2024', 'dd/mm')).toBe('2024-01-24')
  })

  it('passes ISO values through unchanged (no UTC shift)', () => {
    expect(normalizeDate('2024-01-24', 'mm/dd')).toBe('2024-01-24')
    expect(normalizeDate('2024/1/24', 'mm/dd')).toBe('2024-01-24')
  })

  it('passes 2-digit years through unchanged (documented V1 limit)', () => {
    expect(normalizeDate('1/1/24', 'mm/dd')).toBe('1/1/24')
  })

  it('returns empty string for empty input', () => {
    expect(normalizeDate('', 'mm/dd')).toBe('')
    expect(normalizeDate('   ', 'mm/dd')).toBe('')
  })

  it('passes unparseable input through unchanged', () => {
    expect(normalizeDate('not-a-date', 'mm/dd')).toBe('not-a-date')
  })
})

// ── detectType (CSV-IMP-03, M0.2) ─────────────────────────────────────────────

describe('detectType', () => {
  it('maps the CSV 2 vocabulary: DEBIT→expense, CREDIT/DSLIP→income', () => {
    expect(detectType({ mode: 'map', mappedValue: 'DEBIT', rawAmount: '-120.50', numberFormat: 'us' })).toEqual({
      type: 'expense',
      conflict: false,
    })
    expect(detectType({ mode: 'map', mappedValue: 'CREDIT', rawAmount: '+2000.00', numberFormat: 'us' })).toEqual({
      type: 'income',
      conflict: false,
    })
    expect(detectType({ mode: 'map', mappedValue: 'DSLIP', rawAmount: '500.00', numberFormat: 'us' })).toEqual({
      type: 'income',
      conflict: false,
    })
  })

  it('supports the full vocabulary case-insensitively (D/C, +/-, expense/income)', () => {
    expect(detectType({ mode: 'map', mappedValue: 'd', rawAmount: '', numberFormat: 'us' }).type).toBe('expense')
    expect(detectType({ mode: 'map', mappedValue: 'c', rawAmount: '', numberFormat: 'us' }).type).toBe('income')
    expect(detectType({ mode: 'map', mappedValue: '-', rawAmount: '', numberFormat: 'us' }).type).toBe('expense')
    expect(detectType({ mode: 'map', mappedValue: '+', rawAmount: '', numberFormat: 'us' }).type).toBe('income')
    expect(detectType({ mode: 'map', mappedValue: 'Expense', rawAmount: '', numberFormat: 'us' }).type).toBe('expense')
    expect(detectType({ mode: 'map', mappedValue: 'INCOME', rawAmount: '', numberFormat: 'us' }).type).toBe('income')
    expect(detectType({ mode: 'map', mappedValue: '  debit  ', rawAmount: '', numberFormat: 'us' }).type).toBe('expense')
  })

  it('mapped column wins over sign (CSV-IMP-03)', () => {
    const result = detectType({ mode: 'map', mappedValue: 'DEBIT', rawAmount: '+50.00', numberFormat: 'us' })
    expect(result.type).toBe('expense')
  })

  it('flags type-vs-sign conflict, never silently choosing (CSV-IMP-03)', () => {
    const result = detectType({ mode: 'map', mappedValue: 'DEBIT', rawAmount: '+50.00', numberFormat: 'us' })
    expect(result).toEqual({ type: 'expense', conflict: true })
  })

  it('no conflict when mapped type agrees with the sign', () => {
    expect(detectType({ mode: 'map', mappedValue: 'DEBIT', rawAmount: '-50.00', numberFormat: 'us' })).toEqual({
      type: 'expense',
      conflict: false,
    })
    expect(detectType({ mode: 'map', mappedValue: 'CREDIT', rawAmount: '+50.00', numberFormat: 'us' })).toEqual({
      type: 'income',
      conflict: false,
    })
  })

  it('ignores unrecognized bank codes by falling back to the sign (CSV 2 DR/CR/DP)', () => {
    expect(detectType({ mode: 'map', mappedValue: 'DR', rawAmount: '-50.00', numberFormat: 'us' })).toEqual({
      type: 'expense',
      conflict: false,
    })
  })

  it('forces all_expenses / all_income modes', () => {
    expect(detectType({ mode: 'all_expenses', mappedValue: null, rawAmount: '+50.00', numberFormat: 'us' })).toEqual({
      type: 'expense',
      conflict: false,
    })
    expect(detectType({ mode: 'all_income', mappedValue: null, rawAmount: '-50.00', numberFormat: 'us' })).toEqual({
      type: 'income',
      conflict: false,
    })
  })

  it('auto mode derives from the sign (-25.00 → expense, +2000.00 → income)', () => {
    expect(detectType({ mode: 'auto', mappedValue: null, rawAmount: '-25.00', numberFormat: 'us' })).toEqual({
      type: 'expense',
      conflict: false,
    })
    expect(detectType({ mode: 'auto', mappedValue: null, rawAmount: '+2000.00', numberFormat: 'us' })).toEqual({
      type: 'income',
      conflict: false,
    })
  })

  it('auto mode reads unsigned positive amounts as income (file-level default lives in normalizeRows)', () => {
    expect(detectType({ mode: 'auto', mappedValue: null, rawAmount: '500.00', numberFormat: 'us' })).toEqual({
      type: 'income',
      conflict: false,
    })
  })

  it('correctly resolves sign on amounts with US thousands separators', () => {
    expect(detectType({ mode: 'auto', mappedValue: null, rawAmount: '-1,234.56', numberFormat: 'us' })).toEqual({
      type: 'expense',
      conflict: false,
    })
    expect(detectType({ mode: 'auto', mappedValue: null, rawAmount: '+1,234.56', numberFormat: 'us' })).toEqual({
      type: 'income',
      conflict: false,
    })
  })

  it('correctly resolves sign on amounts with EU thousands separators', () => {
    expect(detectType({ mode: 'auto', mappedValue: null, rawAmount: '-1.234,56', numberFormat: 'eu' })).toEqual({
      type: 'expense',
      conflict: false,
    })
    expect(detectType({ mode: 'auto', mappedValue: null, rawAmount: '+1.234,56', numberFormat: 'eu' })).toEqual({
      type: 'income',
      conflict: false,
    })
  })

  it('flags conflict for amounts with thousands separators in map mode', () => {
    expect(detectType({ mode: 'map', mappedValue: 'DEBIT', rawAmount: '+1,234.56', numberFormat: 'us' })).toEqual({
      type: 'expense',
      conflict: true,
    })
    expect(detectType({ mode: 'map', mappedValue: 'CREDIT', rawAmount: '-1.234,56', numberFormat: 'eu' })).toEqual({
      type: 'income',
      conflict: true,
    })
  })
})

// ── normalizeRows (CSV-IMP-04/05/06/11) ───────────────────────────────────────

describe('normalizeRows', () => {
  const csv1Config: ImportConfig = {
    accountId: 'acc-1',
    typeMode: 'auto',
    dateOrder: 'mm/dd',
    numberFormat: 'us',
  }

  it('CSV 1: all-positive file with no type column defaults every row to expense (CSV-IMP-04)', () => {
    const rows = normalizeRows(CSV1_MAPPED, csv1Config, false)
    expect(rows).toHaveLength(4)
    expect(rows.every(row => row.type === 'expense')).toBe(true)
    expect(rows.map(row => row.amount)).toEqual([3.49, 3.49, 3.49, 100])
    expect(rows.map(row => row.date)).toEqual(['2024-01-24', '2024-01-24', '2024-01-24', '2024-01-25'])
    expect(rows.map(row => row.payee)).toEqual(['Rebtel', 'Rebtel', 'Rebtel', 'Opening balance'])
    expect(rows.map(row => row.accountId)).toEqual(['acc-1', 'acc-1', 'acc-1', 'acc-1'])
    expect(rows.map(row => row.possibleDuplicate)).toEqual([false, false, false, false])
  })

  it('CSV 2: mapped Details wins — DEBIT→expense, CREDIT/DSLIP→income, amounts stored positive', () => {
    const config: ImportConfig = {
      accountId: 'acc-2',
      typeMode: 'map',
      dateOrder: 'mm/dd',
      numberFormat: 'us',
    }
    const rows = normalizeRows(CSV2_MAPPED, config, true)
    expect(rows).toHaveLength(3)
    expect(rows.map(row => row.type)).toEqual(['expense', 'income', 'income'])
    expect(rows.map(row => row.amount)).toEqual([120.5, 2000, 500])
    expect(rows.map(row => row.date)).toEqual(['2026-08-10', '2026-08-10', '2026-08-10'])
    expect(rows.map(row => row.typeConflict)).toEqual([false, false, false])
  })

  it('CSV 1 with es bias (DD/MM) parses dates as day-first', () => {
    const config: ImportConfig = { ...csv1Config, dateOrder: 'dd/mm' }
    const rows = normalizeRows([{ date: '24/01/2024', payee: 'X', amount: '10.00' }], config, false)
    expect(rows[0].date).toBe('2024-01-24')
  })

  it('mode switch re-normalizes (CSV-IMP-04): all_income flips the same file', () => {
    const config: ImportConfig = { ...csv1Config, typeMode: 'all_income' }
    const rows = normalizeRows(CSV1_MAPPED, config, false)
    expect(rows.every(row => row.type === 'income')).toBe(true)
  })

  it('auto mode with signed amounts derives type per row and stores positives', () => {
    const config: ImportConfig = {
      accountId: 'acc-1',
      typeMode: 'auto',
      dateOrder: 'mm/dd',
      numberFormat: 'us',
    }
    const rows = normalizeRows(
      [
        { date: '1/24/2024', payee: 'Store', amount: '-25.00' },
        { date: '1/24/2024', payee: 'Client', amount: '+10.00' },
      ],
      config,
      false,
    )
    expect(rows[0]).toMatchObject({ type: 'expense', amount: 25 })
    expect(rows[1]).toMatchObject({ type: 'income', amount: 10 })
  })

  it('flags rows without payee (CSV-IMP-08, M0.7)', () => {
    const rows = normalizeRows([{ date: '1/24/2024', payee: '   ', amount: '5.00' }], csv1Config, false)
    expect(rows[0].payeeMissing).toBe(true)
    expect(rows[0].payee).toBe('')
  })

  it('trims payee and notes', () => {
    const rows = normalizeRows(
      [{ date: '1/24/2024', payee: '  Rebtel  ', notes: '  n  ', amount: '3.49' }],
      csv1Config,
      false,
    )
    expect(rows[0].payee).toBe('Rebtel')
    expect(rows[0].notes).toBe('n')
  })

  it('falls back to mm/dd when dateOrder is not yet resolved (null)', () => {
    const rows = normalizeRows([{ date: '1/24/2024', payee: 'X', amount: '3.49' }], {
      ...csv1Config,
      dateOrder: null,
    }, false)
    expect(rows[0].date).toBe('2024-01-24')
  })

  it('EU number format applied through config (1.234,56 → 1234.56)', () => {
    const config: ImportConfig = { ...csv1Config, numberFormat: 'eu' }
    const rows = normalizeRows([{ date: '1/24/2024', payee: 'X', amount: '1.234,56' }], config, false)
    expect(rows[0].amount).toBe(1234.56)
  })
})

// ── findDuplicateCandidates (CSV-IMP-08, M0.4) ────────────────────────────────

describe('findDuplicateCandidates', () => {
  it('flags all three identical $3.49 Rebtel rows and never skips them (CSV 1)', () => {
    const rows = [
      makeRow(),
      makeRow(),
      makeRow(),
      makeRow({ payee: 'Opening balance', date: '2024-01-25', amount: 100 }),
    ]
    expect(findDuplicateCandidates(rows, 'acc-1')).toEqual(new Set([0, 1, 2]))
  })

  it('returns an empty set when no rows share account+date+amount+payee', () => {
    const rows = [
      makeRow({ payee: 'A' }),
      makeRow({ payee: 'B' }),
      makeRow({ date: '2024-01-25' }),
      makeRow({ amount: 5 }),
    ]
    expect(findDuplicateCandidates(rows, 'acc-1')).toEqual(new Set())
  })

  it('scopes duplicates to the caller-provided account (D4 — config.accountId is the key authority)', () => {
    // Rows are normalized under the file's account, so row.accountId equals the
    // passed accountId in every real flow (M0.1 one account per file).
    const rows = [makeRow({ accountId: 'acc-2' }), makeRow({ accountId: 'acc-2' })]
    expect(findDuplicateCandidates(rows, 'acc-2')).toEqual(new Set([0, 1]))
  })

  it('matches payees case-insensitively after trimming', () => {
    const rows = [makeRow({ payee: 'Rebtel' }), makeRow({ payee: '  REBTEL  ' })]
    expect(findDuplicateCandidates(rows, 'acc-1')).toEqual(new Set([0, 1]))
  })

  it('flags a group of four twins plus one unique row', () => {
    const rows = [
      makeRow({ payee: 'Twin' }),
      makeRow({ payee: 'Twin' }),
      makeRow({ payee: 'Twin' }),
      makeRow({ payee: 'Twin' }),
      makeRow({ payee: 'Solo' }),
    ]
    expect(findDuplicateCandidates(rows, 'acc-1')).toEqual(new Set([0, 1, 2, 3]))
  })
})
