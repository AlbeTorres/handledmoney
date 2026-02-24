'use client'

import { Row } from '@tanstack/react-table'
import toast from 'react-hot-toast'
import { columns } from './columns'
import { DataTable } from './DataTable'
import { Transaction } from './interfaces'

type Props = {
  data: Transaction[]
}

export const TransactionTable = ({ data }: Props) => {
  const onDelete = async (row: Row<Transaction>[]) => {
    const ids = row.map(r => r.original.id)
    const result = { error: false }

    if (result.error) {
      toast.error('Something went wrong!')
    }
  }
  return (
    <DataTable columns={columns} data={data} filterKey='date' onDelete={row => onDelete(row)} />
  )
}
