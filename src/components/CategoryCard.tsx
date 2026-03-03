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
  const bgColor = color + '20'

  return (
    <Link
      href={`/category/${category.id}/edit`}
      className='flex items-center p-4 rounded-xl hover:shadow-md transition-all cursor-pointer group'
      style={{
        backgroundColor: bgColor,
      }}
    >
      <div
        className='size-12 rounded-xl text-white flex items-center justify-center mr-4 transition-all'
        style={{
          backgroundColor: color,
        }}
      >
        <Icon className='size-6 transition-transform group-hover:scale-110' />
      </div>
      <div className='flex-1'>
        <h4 className='font-bold text-sm'>{category.name}</h4>
      </div>
      <ChevronRight className='size-5 text-slate-400 transition-transform group-hover:translate-x-1' />
    </Link>
  )
}
