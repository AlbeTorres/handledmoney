'use client'

import { cn, formatCurrency } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface BudgetSummaryBarProps {
  totalIncome: number
  totalAllocated: number
  remainingToAllocate: number
}

export function BudgetSummaryBar({
  totalIncome,
  totalAllocated,
  remainingToAllocate,
}: BudgetSummaryBarProps) {
  const t = useTranslations('handledmoney.budget')
  // The REAL allocation rate drives the message and tone (it may exceed
  // 100%); only the bar fill is clamped so it never overflows its track.
  const allocationPct = totalIncome > 0 ? (totalAllocated / totalIncome) * 100 : 0
  const barPct = Math.min(allocationPct, 100)
  const tone =
    remainingToAllocate === 0
      ? 'text-success'
      : remainingToAllocate < 0
        ? 'text-destructive'
        : 'text-warning'

  const message =
    remainingToAllocate === 0
      ? t('summary.full')
      : remainingToAllocate < 0
        ? t('summary.over_assigned', { amount: formatCurrency(Math.abs(remainingToAllocate)) })
        : t('summary.needs_job', { amount: formatCurrency(remainingToAllocate) })

  return (
    <section
      aria-label={t('summary.aria')}
      className='rounded-xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur sm:p-5'
    >
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6'>
        <Metric label={t('summary.planned_income')} value={formatCurrency(totalIncome)} />
        <Metric label={t('summary.assigned')} value={formatCurrency(totalAllocated)} />
        <Metric
          label={t('summary.ready_to_assign')}
          value={formatCurrency(remainingToAllocate)}
          valueClass={tone}
        />
      </div>
      <div
        role='progressbar'
        aria-label={t('summary.aria')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(barPct)}
        className='mt-4 h-2 overflow-hidden rounded-full bg-muted'
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            remainingToAllocate < 0
              ? 'bg-destructive'
              : remainingToAllocate === 0
                ? 'bg-success'
                : 'bg-primary',
          )}
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p className={cn('body-sm mt-2 font-medium', tone)}>{message}</p>
    </section>
  )
}

function Metric({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div>
      <p className='label-caps text-muted-foreground'>{label}</p>
      <p className={cn('headline-lg mt-1 tabular-nums text-foreground', valueClass)}>{value}</p>
    </div>
  )
}
