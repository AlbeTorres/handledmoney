'use client'

import { columns } from '@/components/columns'
import { DataTable } from '@/components/financeapp/DataTable'
import { Transaction } from '@/interfaces'
import { Row } from '@tanstack/react-table'

interface AccountTransactionTableProps {
  data: Transaction[]
}

export function AccountTransactionTable({ data }: AccountTransactionTableProps) {
  function deleteTransaction(rows: Row<Transaction>[]) {
    const ids = rows.map(row => row.original.id)
    console.log('Deleting these ids:', ids)
    // TODO: Connect this to actual delete server action if needed
  }

  return <DataTable columns={columns} data={data} filterKey='notes' onDelete={deleteTransaction} />
}
