'use client'

import type { BudgetListItem } from '@/interfaces'
import { PiggyBank } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { BudgetCard } from './BudgetCard'

interface BudgetGridProps {
  budgets: BudgetListItem[]
  currentBudgetId?: string | null
}

export function BudgetGrid({ budgets, currentBudgetId }: BudgetGridProps) {
  const t = useTranslations('handledmoney.budget')

  if (budgets.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24 text-center'>
        <div className='size-16 rounded-2xl bg-primary/10 mb-4 flex items-center justify-center'>
          <PiggyBank className='size-8 text-muted-foreground' />
        </div>
        <h2 className='title-md text-foreground'>{t('list.empty_title')}</h2>
        <p className='text-sm mt-1 max-w-xs text-muted-foreground'>{t('list.empty_description')}</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
      {budgets.map(budget => (
        <BudgetCard key={budget.id} budget={budget} isCurrent={budget.id === currentBudgetId} />
      ))}
    </div>
  )
}
