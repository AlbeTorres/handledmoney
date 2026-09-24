'use client'

import type { Category } from '@/interfaces'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

type Props = {
  id: string
  value?: string
  categories: Category[]
  onValueChange: (value: string | undefined) => void
  disabled?: boolean
  invalid?: boolean
}

/** Searchable, clearable category control shared by transaction create and edit. */
export function TransactionCategorySelect({
  id,
  value,
  categories,
  onValueChange,
  disabled = false,
  invalid = false,
}: Props) {
  const t = useTranslations('handledmoney.transaction.form')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const selected = categories.find(category => category.id === value)
  const matches = useMemo(
    () =>
      categories.filter(category =>
        category.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      ),
    [categories, query],
  )

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  return (
    <div className='flex items-center gap-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-controls={`${id}-options`}
            aria-invalid={invalid}
            disabled={disabled}
            className='w-full justify-between font-normal'
          >
            <span className='truncate'>{selected?.name ?? t('category_placeholder')}</span>
            <ChevronsUpDown className='size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-[--radix-popover-trigger-width] p-2'
          onOpenAutoFocus={event => {
            event.preventDefault()
            searchRef.current?.focus()
          }}
        >
          <Input
            ref={searchRef}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={t('category_search')}
            aria-label={t('category_search')}
            className='mb-2'
          />
          <div
            id={`${id}-options`}
            role='listbox'
            aria-label={t('category')}
            className='max-h-52 overflow-y-auto'
          >
            {matches.map(category => (
              <button
                key={category.id}
                type='button'
                role='option'
                aria-selected={category.id === value}
                className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none'
                onClick={() => {
                  onValueChange(category.id)
                  close()
                }}
              >
                <span className='truncate'>{category.name}</span>
                {category.id === value && (
                  <Check className='ml-auto size-4 shrink-0' aria-hidden='true' />
                )}
              </button>
            ))}
            {matches.length === 0 && (
              <p role='status' className='px-2 py-3 text-sm text-muted-foreground'>
                {categories.length === 0 ? t('category_empty') : t('category_no_results')}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          aria-label={t('category_clear')}
          disabled={disabled}
          onClick={() => onValueChange(undefined)}
        >
          <X aria-hidden='true' />
        </Button>
      )}
    </div>
  )
}
