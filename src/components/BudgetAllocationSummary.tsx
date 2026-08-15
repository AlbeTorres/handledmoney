'use client'

import { getBudgetAllocationTotals } from '@/lib/budget-allocation'
import type { CreateBudgetValues } from '@/lib/schema'
import { useTranslations } from 'next-intl'

// Local formatter, consistent with the en-US/USD pattern used across the
// budget components. Configurable currency is out of scope for now.
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

type BalanceKey = 'balance_positive' | 'balance_zero' | 'balance_negative'

// API choice: the summary accepts the live `groups` and derives the totals
// internally from the pure `getBudgetAllocationTotals` module, so callers never
// have to keep a separate totals object in sync with the form.
export function BudgetAllocationSummary({ groups }: { groups: CreateBudgetValues['groups'] }) {
  const t = useTranslations('handledmoney.budget.form')
  const totals = getBudgetAllocationTotals(groups)

  let balanceKey: BalanceKey = 'balance_zero'
  let balanceClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
  if (totals.unassigned > 0) {
    balanceKey = 'balance_positive'
    balanceClass = 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
  } else if (totals.unassigned < 0) {
    balanceKey = 'balance_negative'
    balanceClass = 'bg-destructive/10 text-destructive'
  }

  return (
    <aside className='rounded-md border bg-card p-4'>
      <dl className='space-y-2 text-sm'>
        <div className='flex items-center justify-between gap-2'>
          <dt className='text-muted-foreground'>{t('allocation_income')}</dt>
          <dd className='mono-data tabular-nums font-semibold'>{formatCurrency(totals.totalIncome)}</dd>
        </div>
        <div className='flex items-center justify-between gap-2'>
          <dt className='text-muted-foreground'>{t('allocation_assigned')}</dt>
          <dd className='mono-data tabular-nums font-semibold'>{formatCurrency(totals.totalAllocated)}</dd>
        </div>
        <div className='flex items-center justify-between gap-2 border-t pt-2'>
          <dt className='text-muted-foreground'>{t('allocation_unassigned')}</dt>
          <dd className='mono-data tabular-nums font-semibold'>{formatCurrency(totals.unassigned)}</dd>
        </div>
      </dl>
      <p role='status' className={`mt-3 rounded-md px-3 py-2 text-sm font-medium ${balanceClass}`}>
        {t(balanceKey)}
      </p>
    </aside>
  )
}
