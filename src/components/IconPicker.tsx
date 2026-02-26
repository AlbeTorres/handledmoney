'use client'
import { ICONS } from '@/lib/data'

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div role='radiogroup' aria-label='Account icon' className='flex flex-wrap w-full gap-4'>
      {ICONS.map(icon => {
        const isSelected = value === icon.name
        return (
          <button
            key={icon.name}
            type='button'
            aria-label={icon.label}
            aria-pressed={isSelected}
            onClick={() => onChange(icon.name)}
            style={{ touchAction: 'manipulation' }}
            className={`aspect-square max-w-16 flex items-center justify-center rounded-md p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isSelected
                ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <icon.icon className='size-6' />
          </button>
        )
      })}
    </div>
  )
}
