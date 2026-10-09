'use client'

import { cn } from '@/lib/utils'

interface BudgetSummaryBarProps { totalIncome: number; totalAllocated: number; remainingToAllocate: number }
const currency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export function BudgetSummaryBar({ totalIncome, totalAllocated, remainingToAllocate }: BudgetSummaryBarProps) {
  const allocationPct = totalIncome > 0 ? Math.min((totalAllocated / totalIncome) * 100, 100) : 0
  const tone = remainingToAllocate === 0 ? 'text-success' : remainingToAllocate < 0 ? 'text-danger' : 'text-warning'
  return (
    <section aria-label='Budget allocation summary' className='sticky top-2 z-10 rounded-xl border border-border bg-card/95 p-4 backdrop-blur sm:p-5'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6'>
        <Metric label='Planned income' value={currency(totalIncome)} />
        <Metric label='Assigned' value={currency(totalAllocated)} />
        <Metric label='Ready to assign' value={currency(remainingToAllocate)} valueClass={tone} />
      </div>
      <div role='progressbar' aria-label='Allocation progress' aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(allocationPct)} className='mt-4 h-2 overflow-hidden rounded-full bg-muted'><div className={cn('h-full rounded-full transition-[width]', remainingToAllocate < 0 ? 'bg-danger' : remainingToAllocate === 0 ? 'bg-success' : 'bg-primary')} style={{ width: `${allocationPct}%` }} /></div>
      <p className={cn('mt-2 body-sm font-medium', tone)}>{remainingToAllocate === 0 ? 'Every dollar has a job.' : remainingToAllocate < 0 ? `${currency(Math.abs(remainingToAllocate))} over-assigned.` : `${currency(remainingToAllocate)} still needs a job.`}</p>
    </section>
  )
}

function Metric({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) { return <div><p className='label-caps text-muted-foreground'>{label}</p><p className={cn('headline-lg mt-1 tabular-nums text-foreground', valueClass)}>{value}</p></div> }
