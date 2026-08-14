'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

export type BudgetCategory = {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

export function CategoryCombobox({
  categories,
  calculationType,
  selectedCategoryId,
  onSelect,
  onCreate,
}: {
  categories: BudgetCategory[]
  calculationType: 'income' | 'outflow'
  selectedCategoryId: string
  onSelect: (id: string) => void
  onCreate: (name: string) => void
}) {
  const t = useTranslations('handledmoney.budget.form')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const expectedType = calculationType === 'income' ? 'income' : 'expense'
  const selected = categories.find(category => category.id === selectedCategoryId)
  const compatible = useMemo(
    () =>
      categories.filter(
        category =>
          category.type === expectedType &&
          category.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [categories, expectedType, query],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between font-normal'
        >
          {selected ? selected.name : t('category_placeholder')}
          <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-[--radix-popover-trigger-width] p-2'>
        <Input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={t('category_search')}
          className='mb-2'
        />
        <div className='max-h-52 overflow-y-auto'>
          {compatible.map(category => (
            <button
              key={category.id}
              type='button'
              className='flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-muted'
              onClick={() => {
                onSelect(category.id)
                setOpen(false)
                setQuery('')
              }}
            >
              <span
                className='size-2 rounded-full'
                style={{ backgroundColor: `#${category.color}` }}
              />
              {category.name}
              {category.id === selectedCategoryId && <Check className='ml-auto size-4' />}
            </button>
          ))}
          {!compatible.length && (
            <p className='px-2 py-3 text-sm text-muted-foreground'>{t('category_empty')}</p>
          )}
        </div>
        <Button
          type='button'
          variant='ghost'
          className='mt-2 w-full justify-start'
          onClick={() => {
            setOpen(false)
            onCreate(query)
          }}
        >
          <Plus className='size-4' />
          {t('create_category')}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
