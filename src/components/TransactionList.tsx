'use client'

import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { Transaction } from '../interfaces'

import { Row } from '@tanstack/react-table'
import { DataTable } from './DataTable'
import { getColumns } from './columns'

interface TransactionListProps {
  data: Transaction[]
  totalPages: number
  currentPage: number
  onRowClick?: (transaction: Transaction) => void
}

export function TransactionList({
  data,
  totalPages,
  currentPage,
  onRowClick,
}: TransactionListProps) {
  const t = useTranslations('handledmoney.transaction')
  const columns = getColumns(t)

  const onDelete = async (rows: Row<Transaction>[]) => {
    const ids = rows.map(r => r.original.id)

    try {
      // TODO: Implement bulk delete server action
      // For now, just show what would be deleted
      console.log('Would delete transactions:', ids)
      toast.success(`Deleted ${ids.length} transaction(s)`)
    } catch {
      toast.error('Something went wrong!')
    }
  }

  return (
    <DataTable
      key={currentPage}
      columns={columns}
      data={data}
      filterKey='date'
      onDelete={onDelete}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  )
}
