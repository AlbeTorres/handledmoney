'use client'

import { CategorySelect } from '@/repository/categories'

import { Search } from 'lucide-react'
import { CategoryCard } from './CategoryCard'
import { Button } from './ui/button'

interface CategoryListProps {
  categories: (CategorySelect & { children?: any[] })[]
  activeType: ('expense' | 'income')[]
  search: string
  sort: string
}

export function CategoryContent({ categories, activeType, search, sort }: CategoryListProps) {
  const clearFilters = () => {
    const params = new URLSearchParams(window.location.search)
    params.delete('type')
    params.delete('search')
    params.delete('sort')
    window.location.search = params.toString()
  }

  const filteredCategories = categories
    .filter(a => {
      const matchesType = !activeType || activeType.length === 0 || activeType.includes(a.type)
      const matchesSearch = !search || (a.name ?? '').toLowerCase().includes(search.toLowerCase())
      return matchesType && matchesSearch
    })
    .sort((a, b) => {
      if (sort === 'category_name') return (a.name ?? '').localeCompare(b.name ?? '')
      if (sort === 'recently_added') return b.createdAt.getTime() - a.createdAt.getTime()
      return 0
    })

  const expensesCategories = filteredCategories.filter(category => category.type === 'expense')
  const incomeCategories = filteredCategories.filter(category => category.type === 'income')

  if (filteredCategories.length === 0) {
    return (
      <div className='w-full mt-14 gap-5 h-full flex flex-col items-center justify-center'>
        <div className='flex flex-col items-center justify-center'>
          <Search size={32} className='text-muted-foreground mb-4' />
          <p className='text-center text-muted-foreground text-sm'>
            No categories match your filters
          </p>
        </div>
        <Button onClick={clearFilters}>Clear Filters</Button>
      </div>
    )
  }

  return (
    <div className='flex flex-col overflow-y-auto space-y-14 pb-8 '>
      {expensesCategories.length > 0 && (
        <div className='flex flex-col gap-4'>
          <p className='text-lg font-semibold'>Expenses</p>
          <div className='w-full bg-gray-200 h-px' />
          <div className='grid grid-cols-1 md:grid-cols-3 items-center content-start justify-center gap-4'>
            {expensesCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}

      {incomeCategories.length > 0 && (
        <div className='flex flex-col gap-4'>
          <p className='text-lg font-semibold'>Income</p>
          <div className='w-full bg-gray-200 h-px' />
          <div className='grid grid-cols-1 md:grid-cols-3 items-center content-start justify-center gap-4'>
            {incomeCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
