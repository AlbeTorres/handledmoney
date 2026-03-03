'use client'

import { CategorySelect } from '@/repository/categories'
import { Search } from 'lucide-react'

import { CategoryCard } from './CategoryCard'

interface CategoryListProps {
  categories: (CategorySelect & { children?: any[] })[]
}

export function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center opacity-50'>
        <div className='size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4'>
          <Search className='size-8 text-slate-400' />
        </div>
        <p className='text-sm text-slate-500 font-medium'>No categories found</p>
        <p className='text-xs text-slate-400 mt-1'>Try adjusting your search</p>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 items-center content-start justify-center px-8 pb-8 gap-4'>
      {categories.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}
