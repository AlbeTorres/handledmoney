'use client'
import type { BudgetItemWithActual } from '@/interfaces'
import { cn, formatCurrency, formatPercentage } from '@/lib/utils'

interface BudgetItemRowProps {
  item: BudgetItemWithActual
  budgetId: string
}

export function BudgetItemRow({ item }: BudgetItemRowProps) {
  // usageRate is a raw 0–1 ratio (NaN when the category has no plan). It
  // drives the tone and the visible percentage, which may exceed 100 % when
  // the category is over-spent; only the bar fill is clamped.
  const usagePct = Number.isNaN(item.usageRate) ? 0 : item.usageRate * 100
  const barPct = Math.min(usagePct, 100)
  const isOver = item.remaining < 0

  const tone = usagePct > 100 ? 'text-destructive' : usagePct > 75 ? 'text-warning' : 'text-success'
  const fill = usagePct > 100 ? 'bg-destructive' : usagePct > 75 ? 'bg-warning' : 'bg-success'
  const remainingTone = isOver ? 'text-destructive' : 'text-muted-foreground'
  const gridCols = 'grid-cols-[minmax(180px,1fr)_104px_104px_104px_88px]'

  return (
    <div
      className={`group ${gridCols} grid items-center gap-0 px-4 py-2.5 transition-colors hover:bg-muted/40 sm:px-5`}
    >
      <div className='min-w-0'>
        <span className='block truncate text-sm font-medium text-foreground'>{item.name}</span>
      </div>

      <div className='flex justify-end'>
        <span className='inline-flex items-center gap-1 tabular-nums text-foreground'>
          {formatCurrency(item.plannedAmount)}
        </span>
      </div>

      <div className='flex justify-end'>
        <span className='inline-flex items-center gap-1 tabular-nums text-foreground'>
          {formatCurrency(item.actualAmount)}
        </span>
      </div>

      <div className='flex justify-end'>
        <span className={cn('inline-flex items-center gap-1 tabular-nums', remainingTone)}>
          {formatCurrency(item.remaining)}
        </span>
      </div>

      <div className='flex flex-col items-end gap-1'>
        <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
          <div
            className={cn('h-full rounded-full transition-all', fill)}
            style={{ width: `${barPct}%` }}
          />
        </div>
        <span className={cn('text-xs tabular-nums', tone)}>{formatPercentage(usagePct)}</span>
      </div>
    </div>
  )
}
