'use client'

import type { BudgetGroupWithItems } from '@/interfaces'
import { formatCurrency } from '@/lib/utils'
import { ChevronDown, ChevronRight, CircleDollarSign, WalletCards } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { BudgetItemRow } from './BudgetItemRow'

export function BudgetGroupSection({
  group,
  budgetId,
}: {
  group: BudgetGroupWithItems
  budgetId: string
}) {
  const t = useTranslations('handledmoney.budget')
  const [collapsed, setCollapsed] = useState(false)
  const isIncome = group.calculationType === 'income'
  const gridCols = 'grid-cols-[minmax(180px,1fr)_104px_104px_104px_88px]'

  return (
    <section className='overflow-hidden rounded-md border border-border bg-card'>
      <div className='flex min-h-16 items-center gap-3 px-4 py-3 sm:px-5'>
        <button
          aria-label={t('group.toggle', { group: group.name })}
          onClick={() => setCollapsed(value => !value)}
          className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
        >
          {collapsed ? <ChevronRight className='size-4' /> : <ChevronDown className='size-4' />}
        </button>
        <div className='flex min-w-0 flex-1 gap-3'>
          {isIncome ? (
            <CircleDollarSign className='size-5 shrink-0 text-primary' aria-hidden='true' />
          ) : (
            <WalletCards className='size-5 shrink-0 text-primary' aria-hidden='true' />
          )}
          <h3 className='text-base font-medium text-foreground'>{group.name}</h3>
          {!isIncome && (
            <span className='rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
              {t('group.expense_badge')}
            </span>
          )}
        </div>
        <div className='hidden text-right sm:block'>
          <p className='label-caps text-muted-foreground'>{t('group.planned')}</p>
          <p className='body-sm font-semibold tabular-nums text-foreground'>
            {formatCurrency(group.groupPlanned)}
          </p>
        </div>
      </div>
      {!collapsed && (
        <div className='border-t border-border'>
          <div className='overflow-x-auto'>
            <div className='min-w-[620px]'>
              <div
                className={`${gridCols} grid gap-0 border-b border-border bg-muted/40 px-4 py-2 sm:px-5`}
              >
                <span className='label-caps text-muted-foreground'>{t('group.category')}</span>
                <span className='label-caps text-right text-muted-foreground'>
                  {t('group.planned')}
                </span>
                <span className='label-caps text-right text-muted-foreground'>
                  {t('group.actual')}
                </span>
                <span className='label-caps text-right text-muted-foreground'>
                  {t('group.remaining')}
                </span>
                <span className='label-caps text-right text-muted-foreground'>
                  {t('group.usage')}
                </span>
              </div>
              {group.items.length === 0 && (
                <p className='body-sm px-5 py-5 italic text-muted-foreground'>
                  {t('group.no_categories')}
                </p>
              )}
              {group.items.map(item => (
                <BudgetItemRow key={item.id} item={item} budgetId={budgetId} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
