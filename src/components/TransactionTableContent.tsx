'use client'

import { Transaction } from '../interfaces'
import { TransactionList } from '@/app/(financeapp)/transaction/components/TransactionList'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

type Props = {
  data: Transaction[]
  totalPages: number
  currentPage: number
  categories?: { id: string; name: string }[]
}

export const TransactionTableContent = ({
  data,
  totalPages,
  currentPage,
  categories = [],
}: Props) => {
  return (
    <Card className='border-none drop-shadow-sm w-full'>
      <CardHeader className='gap-y-2 lg:flex-row lg:items-center lg:justify-between'>
        <CardTitle className='text-xl line-clamp-1'>Transactions History</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionList
          data={data}
          categories={categories}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </CardContent>
    </Card>
  )
}
