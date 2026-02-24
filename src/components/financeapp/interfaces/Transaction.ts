import { Account } from './Account'
import { Category } from './Category'

export interface Transaction {
  id: string
  amount: number
  payee: string
  accountId: string
  accountName: string
  categoryId: string | null
  categoryName: string | undefined
  notes: string | null
  date: string
}
export interface CSVTransaction {
  amount: number
  payee: string
  notes?: string
  date: Date
}

export interface TransactionResponse {
  id: string
  amount: bigint
  payee: string | null
  accountId: string
  categoryId: string | null
  notes: string | null
  date: Date
  category: Category | null
  account: Account
}

export interface CreateOrUpdateTransactionResponse {
  id: string
  amount: bigint
  accountId: string
  categoryId: string | null
  notes: string | null
  date: Date
  userId: string
}

export interface IncomeTransaction {
  id: string
  netAmount: number
  grossAmount: number
  medicareAmount: number
  federalTaxAmount: number
  FICAAmount: number
  hoursWorked: number
  hourlyRate: number
  overtimeHours: number
  overtimeRate: number
  payee: string | null
  notes: string | null
  date: Date
  category: Category | null
  account: Account
  userId: string
}

export interface ExpenseTransaction {
  id: string
  amount: number
  payee: string | null
  notes: string | null
  date: Date
  salesTax: number
  category: Category | null
  account: Account
  userId: string
  attachments: string[]
}
