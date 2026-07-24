'use client'

import { CategorySelect } from '@/repository/categories'

import { CategoryCard } from './CategoryCard'

interface CategoryListProps {
  categories: (CategorySelect & { children?: any[] })[]
  activeType: ('expense' | 'income')[]
  search: string
  sort: string
}

export function CategoryContent({ categories, activeType, search, sort }: CategoryListProps) {
  const filteredCategories = categories
    .filter(a => {
      const matchesType = !activeType || activeType.length === 0 || activeType.includes(a.type)
      const matchesSearch = !search || (a.name ?? '').toLowerCase().includes(search.toLowerCase())
      return matchesType && matchesSearch
    })
    .sort((a, b) => {
      if (sort === 'account_name') return (a.name ?? '').localeCompare(b.name ?? '')
      if (sort === 'recently_added') return b.createdAt.getTime() - a.createdAt.getTime()
      return 0
    })

  return (
    <div className='flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 items-center content-start justify-center pb-8 gap-4'>
      {filteredCategories.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}
