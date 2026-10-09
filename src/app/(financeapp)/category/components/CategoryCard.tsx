'use client'

import { ICONS } from '@/lib/data'
import { CategorySelect } from '@/repository/categories'
import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface CategoryCardProps {
  category: CategorySelect
}

export function CategoryCard({ category }: CategoryCardProps) {
  const t = useTranslations('handledmoney.category')
  const IconData =
    ICONS.find(i => i.name === category.icon) || ICONS.find(i => i.name === 'more_horizontal')
  const Icon = IconData?.icon || ICONS[0].icon

  // Calculate opacity/tint for background
  const color = '#' + category.color || '#94a3b8'

  return (
    <Link href={`/category/${category.id}/edit`} className=''>
      <div
        className='flex justify-between items-center p-5 rounded-2xl border cursor-pointer transition-colors group'
        style={{
          backgroundColor: color + '08',
          borderColor: color + '30',
        }}
      >
        <div className='flex items-center'>
          <div
            className='size-14 rounded-2xl flex items-center justify-center text-white mr-5 transition-colors'
            style={{
              backgroundColor: color,
            }}
          >
            <Icon className='size-6' />
          </div>
          <div>
            <h4 className='font-bold text-base text-foreground'>
              {category.name || t('card.category_name')}
            </h4>
            <p className='text-xs font-semibold' style={{ color: color }}>
              {category.type
                ? category.type.charAt(0).toUpperCase() + category.type.slice(1)
                : t('card.type')}
            </p>
          </div>
        </div>
        <ChevronRight className='size-5 text-muted-foreground transition-transform group-hover:translate-x-1' />
      </div>
    </Link>
  )
}
