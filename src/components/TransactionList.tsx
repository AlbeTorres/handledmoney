'use client'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { Transaction } from '../interfaces'
import { DataTable } from './DataTable'

interface TransactionListProps {
  data: Transaction[]
  categories: { id: string; name: string }[]
  totalPages: number
  currentPage: number
}

export function TransactionList({
  data,
  categories,
  totalPages,
  currentPage,
}: TransactionListProps) {
  const t = useTranslations('handledmoney.transaction')

  const onDelete = async (ids: string[]) => {
    try {
      // TODO: Implement bulk delete server action (soft delete)
      console.log('Would delete transactions:', ids)
      toast.success(`Deleted ${ids.length} transaction(s)`)
    } catch {
      toast.error('Something went wrong!')
    }
  }

  const onBulkCategoryChange = async (categoryId: string, ids: string[]) => {
    try {
      // TODO: Implement bulk category change server action
      console.log('Would change category to:', categoryId, 'for transactions:', ids)
      toast.success(`Updated ${ids.length} transaction(s)`)
    } catch {
      toast.error('Something went wrong!')
    }
  }

  return (
    <DataTable
      key={currentPage}
      data={data}
      categories={categories}
      onBulkDelete={onDelete}
      onBulkCategoryChange={onBulkCategoryChange}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  )
}
