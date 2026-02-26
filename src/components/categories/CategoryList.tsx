'use client'

import { CategorySelect } from '@/repository/categories'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { CategoryCard } from './CategoryCard'

interface CategoryListProps {
  categories: (CategorySelect & { children?: any[] })[]
  activeTab: 'expense' | 'income'
  title: string
  description: string
}

export function CategoryList({ categories, activeTab, title, description }: CategoryListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = categories.filter(
    category =>
      category.type === activeTab && category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      <div className='p-8 pb-4 shrink-0'>
        <div className='flex items-center justify-between mb-1'>
          <h3 className='text-2xl font-bold tracking-tight'>{title}</h3>
        </div>
        <p className='text-sm text-slate-500 mb-8'>{description}</p>

        {/* Tabs */}
        <div className='flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6'>
          <Link
            href='/category?tab=expense'
            className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${
              activeTab === 'expense'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Expenses
          </Link>
          <Link
            href='/category?tab=income'
            className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${
              activeTab === 'income'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Income
          </Link>
        </div>

        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4' />
          <input
            className='w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all'
            placeholder='Search categories...'
            type='text'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className='flex-1 overflow-y-auto px-8 pb-8 space-y-4'>
        {filteredCategories.length > 0 ? (
          filteredCategories.map(category => <CategoryCard key={category.id} category={category} />)
        ) : (
          <div className='flex flex-col items-center justify-center py-20 text-center opacity-50'>
            <div className='size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4'>
              <Search className='size-8 text-slate-400' />
            </div>
            <p className='text-sm text-slate-500 font-medium'>No categories found</p>
            <p className='text-xs text-slate-400 mt-1'>Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  )
}
