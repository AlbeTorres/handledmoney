import { Account } from './Account'
import { Category } from './Category'

export interface TransactionResponse {
  id: string
  type: 'expense' | 'income'
  amount: string | null
  payee: string | null
  accountId: string
  categoryId: string | null
  notes: string | null
  date: Date
  userId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  account: Account
  category: Category | null
}

export interface Transaction {
  id: string
  type: 'expense' | 'income'
  amount: string | null
  payee: string | null
  accountId: string
  categoryId: string | null
  notes: string | null
  date: Date
  userId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  accountName: string
  categoryName: string | undefined
}
export interface CSVTransaction {
  amount: number
  payee: string
  notes?: string
  date: Date
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
