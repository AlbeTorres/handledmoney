'use client'

import { fmt } from '@/lib/utils'
import { TransactionStatusBadge } from './TransactionStatusBadge'

interface TransactionAmountCellProps {
  amount: number
  type: 'income' | 'expense'
  status?: 'cleared' | 'pending' | 'recurring' | null
}

export function TransactionAmountCell({ amount, type, status }: TransactionAmountCellProps) {
  const colorClass = type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'

  return (
    <div data-testid='amount-cell' className={`text-right ${colorClass}`}>
      <div className='font-semibold tabular-nums'>
        <span className='text-slate-400 font-normal'>$</span>
        {fmt(amount)}
      </div>
      {status && <TransactionStatusBadge status={status} />}
    </div>
  )
}
