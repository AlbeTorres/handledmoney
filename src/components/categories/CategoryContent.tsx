'use client'

import { CategorySelect } from '@/repository/categories'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Tab } from '../Tab'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { CategoryList } from './CategoryList'

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

        <div className='flex flex-col md:flex-row items-center justify-center gap-4 mb-6'>
          <InputGroup className='w-full max-w-md border rounded-md focus-within:ring-1 focus-within:ring-blue-600 transition-all'>
            <InputGroupInput
              id='category-search'
              aria-label='Search categories'
              placeholder='Search categories...'
              autoComplete='off'
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <InputGroupAddon>
              <Search className='size-4 text-slate-400' aria-hidden='true' />
            </InputGroupAddon>
          </InputGroup>

          <Link
            href='/category/create'
            className='flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all'
          >
            <Plus className='size-4' />
            New Category
          </Link>
        </div>
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
