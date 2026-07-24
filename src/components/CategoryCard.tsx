'use client'

import { ICONS } from '@/lib/data'
import { CategorySelect } from '@/repository/categories'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface CategoryCardProps {
  category: CategorySelect & { children?: any[] }
}

export function CategoryCard({ category }: CategoryCardProps) {
  const IconData =
    ICONS.find(i => i.name === category.icon) || ICONS.find(i => i.name === 'more_horizontal')
  const Icon = IconData?.icon || ICONS[0].icon

  // Calculate opacity/tint for background
  const color = '#' + category.color || '#94a3b8'

  return (
    <Link href={`/category/${category.id}/edit`} className=''>
      <div
        className='flex justify-between items-center p-5 rounded-2xl border duration-300 shadow-sm hover:shadow-md transition-all cursor-pointer group'
        style={{
          backgroundColor: color + '08',
          borderColor: color + '30',
        }}
      >
        <div className='flex items-center'>
          <div
            className='size-14 rounded-2xl flex items-center justify-center text-white mr-5 shadow-lg shadow-black/5 transition-all'
            style={{
              backgroundColor: color,
              boxShadow: `0 10px 20px -5px ${color}40`,
            }}
          >
            <Icon className='size-6 transition-transform group-hover:scale-110' />
          </div>
          <div>
            <h4 className='font-bold text-base' style={{ color: '#0f172a' }}>
              {category.name || 'Category Name'}
            </h4>
            <p className='text-xs font-semibold' style={{ color: color }}>
              {category.type
                ? category.type.charAt(0).toUpperCase() + category.type.slice(1)
                : 'Type'}
            </p>
          </div>
        </div>
        <ChevronRight className='size-5 text-slate-400 transition-transform group-hover:translate-x-1' />
      </div>
    </Link>
  )
}
