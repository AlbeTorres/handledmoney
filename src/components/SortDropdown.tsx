// components/SortDropdown.tsx
'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { ArrowUpDown, Check } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export type SortOption = {
  label: string
  value: string
}

type Props = {
  options: SortOption[]
  selected: string
  onChange: (value: string) => void
  defaultLabel?: string
}

export default function SortDropdown({
  options,
  selected,
  onChange,
  defaultLabel,
}: Props) {
  const t = useTranslations('handledmoney.account')
  const resolvedDefaultLabel = defaultLabel ?? t('sort.by')
  const activeOption = options.find(o => o.value === selected)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'flex items-center gap-2 rounded-md',
            selected && selected !== 'default' && 'border-primary text-primary',
          )}
        >
          <ArrowUpDown className='size-4' />
          {activeOption ? activeOption.label : resolvedDefaultLabel}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' className='w-48'>
        <DropdownMenuLabel>{t('sort.by')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map(option => {
          const isSelected = option.value === selected
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onChange(option.value)}
              className='flex items-center justify-between cursor-pointer'
            >
              {option.label}
              {isSelected && <Check className='size-4 text-primary' />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
