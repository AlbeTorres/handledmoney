'use client'

import { fmt } from '@/lib/utils'
import { TransactionStatusBadge } from '@/app/(financeapp)/transaction/[id]/components/TransactionStatusBadge'

interface TransactionAmountCellProps {
  amount: number
  type: 'income' | 'expense'
  status?: 'cleared' | 'pending' | 'recurring' | null
}

export function TransactionAmountCell({ amount, type, status }: TransactionAmountCellProps) {
  const colorClass = type === 'income' ? 'text-success' : 'text-foreground'

  return (
    <div data-testid='amount-cell' className={`text-right ${colorClass}`}>
      <div className='font-semibold tabular-nums'>
        <span className='font-normal text-muted-foreground'>$</span>
        {fmt(amount)}
      </div>
      {status && <TransactionStatusBadge status={status} />}
    </div>
  )
}
