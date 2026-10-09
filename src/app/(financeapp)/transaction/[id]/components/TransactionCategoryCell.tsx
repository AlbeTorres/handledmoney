'use client'

import { useTranslations } from 'next-intl'
import { ICONS } from '@/lib/data'
import { Landmark } from 'lucide-react'

const CategoryIconByKey = new Map<string, typeof Landmark>(ICONS.map(i => [i.name, i.icon]))
const DEFAULT_CATEGORY_ICON = Landmark

function categoryGlyph(icon: string | undefined) {
  const Icon = (icon && CategoryIconByKey.get(icon)) || (ICONS[0]?.icon ?? DEFAULT_CATEGORY_ICON)
  return <Icon className='size-4 text-muted-foreground' />
}

interface TransactionCategoryCellProps {
  categoryName: string | undefined
  icon?: string
}

export function TransactionCategoryCell({ categoryName, icon }: TransactionCategoryCellProps) {
  const t = useTranslations('handledmoney.transaction')

  const display = categoryName || t('category_cell.uncategorized')

  return (
    <div className='flex items-center gap-2'>
      <div className='flex size-7 shrink-0 items-center justify-center rounded-full bg-muted'>
        {categoryGlyph(icon)}
      </div>
      <span className='truncate text-sm font-medium text-foreground'>{display}</span>
    </div>
  )
}