// components/FilterDropdown.tsx
'use client'

import { cn } from '@/lib/utils'
import { Check, ChevronDown, ListFilter, LucideIcon } from 'lucide-react' // Importamos LucideIcon
import { useTranslations } from 'next-intl'
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
  onChange: (value: string[]) => void
  multiple?: boolean // Nueva prop para alternar entre uno o múltiples
  icon?: LucideIcon // Nueva prop para el ícono personalizado
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  multiple = true, // Por defecto sigue siendo múltiple para no romper tu código actual
  icon: Icon = ListFilter, // Ícono por defecto si no se pasa ninguno
}: Props) {
  const t = useTranslations('handledmoney.account')

  const toggle = (value: string) => {
    if (multiple) {
      // Comportamiento múltiple original
      if (selected.includes(value)) {
        onChange(selected.filter(v => v !== value))
      } else {
        onChange([...selected, value])
      }
    } else {
      // Comportamiento de selección única: si se hace clic en el que ya está seleccionado, se limpia, si no, se reemplaza
      if (selected.includes(value)) {
        onChange([])
      } else {
        onChange([value])
      }
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
          <Icon className='size-4' /> {/* Usamos el ícono dinámico aquí */}
          {label}
          {selected.length > 0 && (
            <Badge variant='secondary' className='ml-1 rounded-sm px-1.5'>
              {multiple
                ? selected.length
                : options.find(option => option.value === selected[0])?.label}
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
                // Si es múltiple, prevenimos que se cierre. Si es único, dejamos que se cierre automáticamente.
                if (multiple) e.preventDefault()
                toggle(option.value)
              }}
              className='flex items-center justify-between cursor-pointer'
            >
              {option.label}
              {isSelected && <Check className='size-4 text-primary' />}
            </DropdownMenuItem>
          )
        })}
        {/* El botón de limpiar solo aparece en modo múltiple para evitar confusiones */}
        {multiple && selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={clear}
              className='text-muted-foreground cursor-pointer justify-center'
            >
              {t('filter.clear')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
