'use client'
import { Transaction } from '@/interfaces'
import { DataTable } from './DataTable'

interface AccountTransactionTableProps {
  data: Transaction[]
  categories: { id: string; name: string }[]
  totalPages: number
  currentPage: number
}

export function AccountTransactionTable({
  data,
  categories,
  totalPages,
  currentPage,
}: AccountTransactionTableProps) {
  function onDelete(ids: string[]) {
    // TODO: Connect this to actual delete server action if needed
    console.log('Deleting these ids:', ids)
  }

  function onBulkCategoryChange(categoryId: string, ids: string[]) {
    // TODO: Connect this to actual bulk category change server action
    console.log('Would change category to:', categoryId, 'for ids:', ids)
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
