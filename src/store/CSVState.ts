import { IMPORT_RESULT } from '@/interfaces'
import { create } from 'zustand'

enum VARIANTS {
  LIST = 'LIST',
  IMPORT = 'IMPORT',
}
type Props = {
  importResult: IMPORT_RESULT
  isImporting: 'LIST' | 'IMPORT'
  onImport: () => void
  onCancelImport: () => void
  setResults: (results: IMPORT_RESULT) => void
}

export const useCSVState = create<Props>(set => ({
  importResult: {
    data: [],
    errors: [],
    meta: {},
  },
  isImporting: VARIANTS.LIST,
  onImport: () => set({ isImporting: 'IMPORT' }),
  onCancelImport: () => set({ isImporting: 'LIST' }),
  setResults: (results: IMPORT_RESULT) => set({ importResult: results }),
}))
