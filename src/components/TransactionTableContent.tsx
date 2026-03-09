'use client'

import toast from 'react-hot-toast'
import { Transaction } from '../interfaces'

import { Row } from '@tanstack/react-table'
import { DataTable } from './DataTable'
import { columns } from './columns'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

type Props = {
  data: Transaction[]
  totalPages: number
  currentPage: number
}

const DB_CHUNK_SIZE = 100
const UI_PAGE_SIZE = 10

export const TransactionTableContent = ({ data, totalPages, currentPage }: Props) => {
  const onDelete = async (row: Row<Transaction>[]) => {
    const ids = row.map(r => r.original.id)
    const result = { error: false }

    if (result.error) {
      toast.error('Something went wrong!')
    }
  }
  return (
    <Card className='border-none drop-shadow-sm'>
      <CardHeader className='gap-y-2 lg:flex-row lg:items-center lg:justify-between'>
        <CardTitle className='text-xl line-clamp-1'>Transactions History</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          filterKey='date'
          onDelete={row => onDelete(row)}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </CardContent>
    </Card>
  )
}
