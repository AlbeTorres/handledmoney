'use client'

import { Transaction } from '@/interfaces'
import { Row } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { DataTable } from './DataTable'
import { getColumns } from './columns'

interface AccountTransactionTableProps {
  data: Transaction[]
  totalPages: number
  currentPage: number
}

export function AccountTransactionTable({
  data,
  totalPages,
  currentPage,
}: AccountTransactionTableProps) {
  const t = useTranslations('handledmoney.transaction')
  const columns = getColumns(t)

  function onDelete(rows: Row<Transaction>[]) {
    const ids = rows.map(row => row.original.id)
    console.log('Deleting these ids:', ids)
    // TODO: Connect this to actual delete server action if needed
  }

  return (
    <DataTable
      key={currentPage}
      columns={columns}
      data={data}
      filterKey='date'
      onDelete={row => onDelete(row)}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  )
}
