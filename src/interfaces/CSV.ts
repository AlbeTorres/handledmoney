import type { ParseResult } from 'papaparse'

/**
 * Typed papaparse result for raw CSV uploads (CSV-IMP-07, defect 12).
 * `data` is the string[][] matrix (header row included when parsed with
 * header: false); `errors` are typed `ParseError[]` and `meta` is a full
 * `ParseMeta`.
 */
export type IMPORT_RESULT = ParseResult<string[]>

export enum VARIANTS {
  LIST = 'LIST',
  IMPORT = 'IMPORT',
  REVIEW = 'REVIEW',
}

export interface SelectedColumns {
  [key: string]: string | null
}
