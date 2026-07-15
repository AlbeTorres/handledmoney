'use client'

import { CategorySelect } from '@/repository/categories'
import { useState } from 'react'

import ActionBar from './ActionBar'
import { CategoryList } from './CategoryList'
import { Tab } from './Tab'

interface CategoryListProps {
  categories: (CategorySelect & { children?: any[] })[]
  activeTab: 'expense' | 'income'
  title: string
  description: string
}

export function CategoryContent({ categories, activeTab, title, description }: CategoryListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeView, setActiveView] = useState('expense')

  function handleViewChange(view: string) {
    setActiveView(view)
  }

  const filteredCategories = categories.filter(
    category =>
      category.type === activeView &&
      category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      <div className='p-8 pb-4 shrink-0'>
        <div className='flex items-center justify-between mb-1'>
          <h3 className='text-2xl font-bold tracking-tight'>{title}</h3>
        </div>
        <p className='text-sm text-slate-500 mb-8'>{description}</p>
        <ActionBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          href='/category/create'
          id='category-search'
          placeholder='Search categories...'
          ariaLabel='Search categories'
          buttonText='New Category'
        />

        <div className='flex items-center justify-center md:justify-start'>
          <Tab
            activeView={activeView}
            onViewChange={handleViewChange}
            tabs={['expense', 'income']}
          />
        </div>
      </div>
      <CategoryList categories={filteredCategories} />
    </div>
  )
}
