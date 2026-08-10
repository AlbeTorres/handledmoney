import { IMPORT_RESULT, VARIANTS } from '@/interfaces'
import type { ImportConfig, NormalizedRow } from '@/lib/csv/types'
import { create } from 'zustand'

/**
 * Typed empty parse result matching papaparse's ParseResult contract
 * (CSV-IMP-07). CardContainer.tsx:17 uses a bare `meta: {}` literal that
 * task 2.5 will replace with this shape.
 */
const EMPTY_PARSE_RESULT: IMPORT_RESULT = {
  data: [],
  errors: [],
  meta: { delimiter: '', linebreak: '', aborted: false, truncated: false, cursor: 0 },
}

const DEFAULT_CONFIG: ImportConfig = {
  accountId: '',
  typeMode: 'auto',
  dateOrder: null,
  numberFormat: 'us',
}

type Props = {
  importResult: IMPORT_RESULT
  isImporting: 'LIST' | 'IMPORT' | 'REVIEW'
  config: ImportConfig
  normalizedRows: NormalizedRow[]
  onImport: () => void
  onCancelImport: () => void
  setResults: (results: IMPORT_RESULT) => void
  setConfig: (patch: Partial<ImportConfig>) => void
  setNormalizedRows: (rows: NormalizedRow[]) => void
  excludeRows: (indices: number[]) => void
  setRowType: (indices: number[], type: 'expense' | 'income') => void
}

export const useCSVState = create<Props>(set => ({
  importResult: EMPTY_PARSE_RESULT,
  isImporting: VARIANTS.LIST,
  config: DEFAULT_CONFIG,
  normalizedRows: [],
  onImport: () => set({ isImporting: 'IMPORT' }),
  onCancelImport: () => set({ isImporting: 'LIST' }),
  setResults: (results: IMPORT_RESULT) => set({ importResult: results }),
  // Partial merge — header controls patch single fields without clobbering the rest (D5).
  setConfig: (patch: Partial<ImportConfig>) =>
    set(state => ({ config: { ...state.config, ...patch } })),
  setNormalizedRows: (rows: NormalizedRow[]) => set({ normalizedRows: rows }),
  // D6: exclusion is a flag; submit filters by !excluded. Stable indices keep
  // the backend error-report mapping intact (CSV-IMP-08/09).
  excludeRows: (indices: number[]) =>
    set(state => ({
      normalizedRows: state.normalizedRows.map((row, index) =>
        indices.includes(index) ? { ...row, excluded: true } : row,
      ),
    })),
  setRowType: (indices: number[], type: 'expense' | 'income') =>
    set(state => ({
      normalizedRows: state.normalizedRows.map((row, index) =>
        indices.includes(index) ? { ...row, type } : row,
      ),
    })),
}))
