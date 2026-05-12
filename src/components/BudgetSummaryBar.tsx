'use client'

import { cn } from '@/lib/utils'

interface BudgetSummaryBarProps {
  totalIncome: number
  totalAllocated: number
  remainingToAllocate: number
}

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export function BudgetSummaryBar({ totalIncome, totalAllocated, remainingToAllocate }: BudgetSummaryBarProps) {
  if (totalIncome === 0) return null

  const allocatedPct = Math.min((totalAllocated / totalIncome) * 100, 100)
  const isBalanced = remainingToAllocate === 0
  const isOverspent = remainingToAllocate < 0

  return (
    <div className='rounded-2xl border border-border bg-card p-5 space-y-3'>
      <div className='flex items-center justify-between text-sm'>
        <span className='text-muted-foreground'>Allocated</span>
        <span className='font-medium tabular-nums'>
          {currency(totalAllocated)} / {currency(totalIncome)}
        </span>
      </div>

      <div className='relative h-3 w-full rounded-full bg-muted overflow-hidden'>
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isBalanced && 'bg-emerald-500',
            !isBalanced && !isOverspent && 'bg-amber-500',
            isOverspent && 'bg-red-500',
          )}
          style={{ width: `${Math.min(allocatedPct, 100)}%` }}
        />
      </div>

      <div className='flex items-center justify-between text-xs'>
        <span className={cn('font-medium', isBalanced && 'text-emerald-600', isOverspent && 'text-red-600', !isBalanced && !isOverspent && 'text-amber-600')}>
          {isBalanced && '\u2713 Fully allocated'}
          {isOverspent && `\u2191 ${currency(Math.abs(remainingToAllocate))} over budget`}
          {!isBalanced && !isOverspent && `${currency(remainingToAllocate)} remaining to allocate`}
        </span>
        <span className='text-muted-foreground'>{Math.round(allocatedPct)}%</span>
      </div>
    </div>
  )
}
