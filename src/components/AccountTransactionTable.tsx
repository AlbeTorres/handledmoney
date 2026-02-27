'use client'

import { DataTable } from '@/components/financeapp/DataTable'
import { columns } from '@/components/financeapp/columns'
import { Transaction } from '@/components/financeapp/interfaces'
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
