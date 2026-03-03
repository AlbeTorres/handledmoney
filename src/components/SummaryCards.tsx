'use client'

import { useTransactionState } from '@/store'
import { Plus } from 'lucide-react'
import { Button } from './ui/button'

type Props = {
  activeView: string
}

export default function SummaryCards({ activeView }: Props) {
  const { onOpen } = useTransactionState()

  if (activeView === 'income') {
    return (
      <div className='flex items-center justify-end gap-6'>
        <Button
          variant='default'
          className='bg-emerald-600 hover:bg-emerald-700'
          size='lg'
          onClick={() => onOpen()}
        >
          <Plus />
          Add New Income
        </Button>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-end gap-6'>
      <Button
        variant='destructive'
        className='bg-red-600 hover:bg-red-700'
        size='lg'
        onClick={() => onOpen()}
      >
        <Plus />
        Add New Expense
      </Button>
    </div>
  )
}
