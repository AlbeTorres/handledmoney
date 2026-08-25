'use client'
import type { BudgetItemWithActual } from '@/interfaces'
import { cn } from '@/lib/utils'

interface BudgetItemRowProps {
  item: BudgetItemWithActual
  budgetId: string
}

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export function BudgetItemRow({ item }: BudgetItemRowProps) {
  const isOver = item.remaining < 0
  const usagePct = isNaN(item.usageRate) ? 0 : Math.min(item.usageRate * 100, 100)

  return (
    <div className='group grid grid-cols-[minmax(180px,1fr)_104px_88px] items-center gap-0 px-4 py-2.5 transition-colors hover:bg-muted/40 sm:px-5'>
      <div className='min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-foreground truncate'>{item.name}</span>
        </div>
      </div>

      <div className='flex justify-end'>
        <span className='inline-flex items-center gap-1'>{currency(item.plannedAmount)}</span>
      </div>

      <div className='px-3'>
        <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
          <div
            className={cn(
              'h-full rounded-full transition-all',
              usagePct > 100 ? 'bg-red-500' : usagePct > 75 ? 'bg-amber-500' : 'bg-emerald-500',
            )}
            style={{ width: `${usagePct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
