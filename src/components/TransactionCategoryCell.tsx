'use client'

import { useTranslations } from 'next-intl'
import { getIconComponent } from '@/lib/utils'

interface TransactionCategoryCellProps {
  categoryName: string | undefined
  icon?: string
}

export function TransactionCategoryCell({ categoryName, icon }: TransactionCategoryCellProps) {
  const t = useTranslations('handledmoney.transaction')

  const Icon = getIconComponent(icon ?? '')
  const display = categoryName || t('category_cell.uncategorized')

  return (
    <div className='flex items-center gap-2'>
      <div className='flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800'>
        <Icon className='size-4 text-slate-500 dark:text-slate-400' />
      </div>
      <span className='truncate text-sm font-medium text-slate-800 dark:text-slate-200'>
        {display}
      </span>
    </div>
  )
}
