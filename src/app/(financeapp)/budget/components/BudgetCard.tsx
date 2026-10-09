'use client'

import type { BudgetListItem } from '@/interfaces'
import { cn } from '@/lib/utils'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import Link from 'next/link'

const currency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
const date = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))

export function BudgetCard({
  budget,
  isCurrent = false,
}: {
  budget: BudgetListItem
  isCurrent?: boolean
}) {
  const progress =
    budget.totalIncome > 0 ? Math.min((budget.totalAllocated / budget.totalIncome) * 100, 100) : 0
  const balanceClass =
    budget.remainingToAllocate === 0
      ? 'text-success'
      : budget.remainingToAllocate < 0
        ? 'text-danger'
        : 'text-warning'

  return (
    <Link
      href={`/budget/${budget.id}`}
      className='group rounded-xl border border-border bg-card p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h2 className='title-md truncate text-foreground transition-colors group-hover:text-primary'>
            {budget.name}
          </h2>
          <p className='body-sm mt-1 flex items-center gap-1.5 text-muted-foreground'>
            <CalendarDays className='size-3.5' />
            {date(budget.startDate)}
            {budget.endDate ? ` – ${date(budget.endDate)}` : ' – ongoing'}
          </p>
        </div>
        {isCurrent ? (
          <span className='label-caps shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-primary'>
            Current
          </span>
        ) : (
          <span className='label-caps shrink-0 rounded-full bg-muted px-2.5 py-1 text-muted-foreground'>
            History
          </span>
        )}
      </div>

      <div className='mt-7 grid grid-cols-2 gap-4'>
        <div>
          <p className='label-caps text-muted-foreground'>Planned income</p>
          <p className='headline-lg mt-1 text-foreground'>{currency(budget.totalIncome)}</p>
        </div>
        <div>
          <p className='label-caps text-muted-foreground'>Allocated</p>
          <p className='headline-lg mt-1 text-foreground'>{currency(budget.totalAllocated)}</p>
        </div>
      </div>

      <div className='mt-6'>
        <div className='mb-2 flex items-center justify-between body-sm'>
          <span className='text-muted-foreground'>Ready to assign</span>
          <span className={`font-semibold tabular-nums ${balanceClass}`}>
            {currency(budget.remainingToAllocate)}
          </span>
        </div>
        <div
          role='progressbar'
          aria-label={budget.name}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className='h-2 overflow-hidden rounded-full bg-muted'
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width]',
              budget.remainingToAllocate < 0
                ? 'bg-danger'
                : budget.remainingToAllocate === 0
                  ? 'bg-success'
                  : 'bg-primary',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className='mt-3 flex items-center justify-between body-sm text-muted-foreground'>
          <span>{Math.round(progress)}% assigned</span>
          <span className='inline-flex items-center gap-1 font-medium text-foreground'>
            Open{' '}
            <ArrowUpRight className='size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
          </span>
        </div>
      </div>
    </Link>
  )
}
