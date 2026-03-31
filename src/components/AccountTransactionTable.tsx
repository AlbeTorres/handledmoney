'use client'

import { columns } from '@/components/columns'

import { Transaction } from '@/interfaces'
import { Row } from '@tanstack/react-table'
import { DataTable } from './DataTable'

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
