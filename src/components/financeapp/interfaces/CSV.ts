export interface IMPORT_RESULT {
  data: string[][]
  errors: []
  meta: {}
}

export enum VARIANTS {
  LIST = 'LIST',
  IMPORT = 'IMPORT',
}

export interface SelectedColumns {
  [key: string]: string | null
}
