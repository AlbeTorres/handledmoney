import { beforeEach, describe, expect, it } from 'vitest'
import { useCSVState } from '@/store/CSVState'
import type { ImportConfig, NormalizedRow } from '@/lib/csv/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const DEFAULT_CONFIG: ImportConfig = {
  accountId: '',
  typeMode: 'auto',
  dateOrder: null,
  numberFormat: 'us',
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useCSVState', () => {
  // Reset the store before each test so previous tests don't pollute state.
  beforeEach(() => {
    useCSVState.setState({
      isImporting: 'LIST',
      config: DEFAULT_CONFIG,
      normalizedRows: [],
      importResult: {
        data: [],
        errors: [],
        meta: { delimiter: '', linebreak: '', aborted: false, truncated: false, cursor: 0 },
      },
    })
  })

  // ── Initial state (D1) ──────────────────────────────────────────────────────

  it('starts in LIST with the default config and no normalized rows', () => {
    const state = useCSVState.getState()
    expect(state.isImporting).toBe('LIST')
    expect(state.config).toEqual(DEFAULT_CONFIG)
    expect(state.normalizedRows).toEqual([])
    expect(state.importResult.data).toEqual([])
  })

  // ── Flow transitions ────────────────────────────────────────────────────────

  it('onImport moves to IMPORT and onCancelImport returns to LIST', () => {
    useCSVState.getState().onImport()
    expect(useCSVState.getState().isImporting).toBe('IMPORT')

    useCSVState.getState().onCancelImport()
    expect(useCSVState.getState().isImporting).toBe('LIST')
  })

  // ── setResults ──────────────────────────────────────────────────────────────

  it('setResults stores the typed parse result', () => {
    const result = {
      data: [['Date', 'Amount'], ['1/24/2024', '3.49']],
      errors: [],
      meta: { delimiter: ',', linebreak: '\n', aborted: false, truncated: false, cursor: 42 },
    }
    useCSVState.getState().setResults(result)
    expect(useCSVState.getState().importResult).toEqual(result)
  })

  // ── setConfig (D5) ──────────────────────────────────────────────────────────

  it('setConfig merges a partial patch without clobbering other fields', () => {
    useCSVState.getState().setConfig({ accountId: 'acc-9' })
    const config = useCSVState.getState().config
    expect(config.accountId).toBe('acc-9')
    expect(config.typeMode).toBe('auto')
    expect(config.dateOrder).toBeNull()
    expect(config.numberFormat).toBe('us')
  })

  it('setConfig overrides every field in one call', () => {
    useCSVState.getState().setConfig({
      accountId: 'acc-9',
      typeMode: 'map',
      dateOrder: 'dd/mm',
      numberFormat: 'eu',
    })
    expect(useCSVState.getState().config).toEqual({
      accountId: 'acc-9',
      typeMode: 'map',
      dateOrder: 'dd/mm',
      numberFormat: 'eu',
    })
  })

  // ── setNormalizedRows ───────────────────────────────────────────────────────

  it('setNormalizedRows replaces the review rows', () => {
    const rows = [makeRow(), makeRow({ payee: 'Client', type: 'income', amount: 2000 })]
    useCSVState.getState().setNormalizedRows(rows)
    expect(useCSVState.getState().normalizedRows).toEqual(rows)
  })

  // ── excludeRows (D6) ────────────────────────────────────────────────────────

  it('excludeRows flags only the given indices as excluded', () => {
    const rows = [makeRow(), makeRow(), makeRow(), makeRow()]
    useCSVState.getState().setNormalizedRows(rows)
    useCSVState.getState().excludeRows([1, 3])

    const updated = useCSVState.getState().normalizedRows
    expect(updated[0].excluded).toBe(false)
    expect(updated[1].excluded).toBe(true)
    expect(updated[2].excluded).toBe(false)
    expect(updated[3].excluded).toBe(true)
  })

  it('excludeRows keeps other row fields untouched', () => {
    const rows = [makeRow({ payee: 'Rebtel', amount: 3.49 })]
    useCSVState.getState().setNormalizedRows(rows)
    useCSVState.getState().excludeRows([0])
    expect(useCSVState.getState().normalizedRows[0]).toMatchObject({
      payee: 'Rebtel',
      amount: 3.49,
      excluded: true,
    })
  })

  it('excludeRows with an empty index list changes nothing', () => {
    const rows = [makeRow()]
    useCSVState.getState().setNormalizedRows(rows)
    useCSVState.getState().excludeRows([])
    expect(useCSVState.getState().normalizedRows[0].excluded).toBe(false)
  })

  // ── setRowType (bulk type change) ───────────────────────────────────────────

  it('setRowType updates only the given indices', () => {
    const rows = [makeRow(), makeRow(), makeRow()]
    useCSVState.getState().setNormalizedRows(rows)
    useCSVState.getState().setRowType([0, 2], 'income')

    const updated = useCSVState.getState().normalizedRows
    expect(updated[0].type).toBe('income')
    expect(updated[1].type).toBe('expense')
    expect(updated[2].type).toBe('income')
  })

  it('setRowType preserves exclusion and flags', () => {
    const rows = [makeRow({ excluded: true, possibleDuplicate: true })]
    useCSVState.getState().setNormalizedRows(rows)
    useCSVState.getState().setRowType([0], 'income')
    expect(useCSVState.getState().normalizedRows[0]).toMatchObject({
      type: 'income',
      excluded: true,
      possibleDuplicate: true,
    })
  })
})
