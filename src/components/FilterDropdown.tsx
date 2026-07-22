// components/FilterDropdown.tsx
'use client'

import { cn } from '@/lib/utils'
import { Check, ChevronDown, ListFilter } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export type FilterOption = {
  label: string
  value: string
}

type Props = {
  label: string
  options: FilterOption[]
  selected: string[]
  onChange: (values: string[]) => void
}

export default function FilterDropdown({ label, options, selected, onChange }: Props) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const clear = () => onChange([])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'flex items-center gap-2 rounded-md',
            selected.length > 0 && 'border-primary text-primary',
          )}
        >
          <ListFilter className='size-4' />
          {label}
          {selected.length > 0 && (
            <Badge variant='secondary' className='ml-1 rounded-sm px-1.5'>
              {selected.length}
            </Badge>
          )}
          <ChevronDown className='size-4 opacity-50' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' className='w-48'>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map(option => {
          const isSelected = selected.includes(option.value)
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={e => {
                e.preventDefault() // evita que se cierre al seleccionar
                toggle(option.value)
              }}
              className='flex items-center justify-between cursor-pointer'
            >
              {option.label}
              {isSelected && <Check className='size-4 text-primary' />}
            </DropdownMenuItem>
          )
        })}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={clear}
              className='text-muted-foreground cursor-pointer justify-center'
            >
              Clear filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
