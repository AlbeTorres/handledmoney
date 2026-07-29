export interface TransactionTypeConfig {
  value: string
  labelKey: string // clave de i18n, e.g. 'transaction_type_income'
  variant: 'success' | 'destructive' | 'secondary' | 'outline' // variantes del Badge de shadcn
}

/**
 * Array configurable de tipos de transacción.
 * Para agregar un nuevo tipo (e.g. 'investment'), solo agregar una entrada aquí.
 * El labelKey se usa con next-intl: t(labelKey)
 */
export const TRANSACTION_TYPES: TransactionTypeConfig[] = [
  {
    value: 'income',
    labelKey: 'transaction_type_income',
    variant: 'success',
  },
  {
    value: 'expense',
    labelKey: 'transaction_type_expense',
    variant: 'destructive',
  },
]

/**
 * Lookup helper: dado un type string, devuelve su config.
 * Si el type no existe en el array, devuelve un fallback genérico.
 */
export function getTransactionTypeConfig(type: string): TransactionTypeConfig {
  return (
    TRANSACTION_TYPES.find(t => t.value === type) ?? {
      value: type,
      labelKey: `transaction_type_${type}`,
      variant: 'secondary',
    }
  )
}
