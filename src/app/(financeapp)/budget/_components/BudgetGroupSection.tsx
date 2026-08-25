'use client'

import type { BudgetGroupWithItems } from '@/interfaces'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, CircleDollarSign, WalletCards } from 'lucide-react'
import { useState } from 'react'

import { BudgetItemRow } from './BudgetItemRow'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

// ssssss

export function BudgetGroupSection({
  group,
  budgetId,
}: {
  group: BudgetGroupWithItems
  budgetId: string
}) {
  const [collapsed, setCollapsed] = useState(false)
  const isIncome = group.calculationType === 'income'

  return (
    <section className='overflow-hidden rounded-md border border-border bg-card'>
      <div className='flex min-h-16 items-center gap-3 px-4 py-3 sm:px-5'>
        <button
          aria-label={`Toggle ${group.name}`}
          onClick={() => setCollapsed(value => !value)}
          className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
        >
          {collapsed ? <ChevronRight className='size-4' /> : <ChevronDown className='size-4' />}
        </button>
        <div className='flex min-w-0 gap-3 flex-1'>
          {group.calculationType === 'income' ? (
            <CircleDollarSign className='size-5 shrink-0 text-primary' aria-hidden='true' />
          ) : (
            <WalletCards className='size-5 shrink-0 text-primary' aria-hidden='true' />
          )}
          <h3 className='text-base font-medium'>{group.name}</h3>
          {group.calculationType !== 'income' && (
            <span className='rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
              Expense
            </span>
          )}
        </div>
        <div className='hidden text-right sm:block'>
          <p className='label-caps text-muted-foreground'>Planned</p>
          <p className='body-sm font-semibold tabular-nums'>{currency(group.groupPlanned)}</p>
        </div>
      </div>
      {!collapsed && (
        <div className='border-t border-border'>
          <div className='overflow-x-auto'>
            <div className='min-w-[620px]'>
              <div className='grid grid-cols-[minmax(180px,1fr)_104px_88px] gap-0 border-b border-border bg-muted/40 px-4 py-2 sm:px-5'>
                <span className='label-caps text-muted-foreground'>Category</span>
                <span className='label-caps text-right text-muted-foreground'>Planned</span>

                <span className='label-caps text-right text-muted-foreground'>Usage</span>
                <span />
              </div>
              {group.items.length === 0 && (
                <p className='px-5 py-5 body-sm italic text-muted-foreground'>
                  No categories assigned yet.
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
