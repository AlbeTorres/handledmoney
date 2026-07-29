import Papa from 'papaparse'
import { Transaction } from '@/interfaces'

export function exportTransactionsToCSV(
  transactions: Transaction[],
  filename: string = 'transactions.csv',
) {
  const csvData = transactions.map(tx => ({
    Date: tx.date instanceof Date ? tx.date.toISOString().split('T')[0] : String(tx.date),
    Payee: tx.payee,
    Category: tx.categoryName || 'Uncategorized',
    Account: tx.accountName,
    Type: tx.type,
    Amount: Number(tx.amount || 0),
    Notes: tx.notes || '',
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
