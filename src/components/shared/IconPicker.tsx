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
            className={`aspect-square max-w-16 cursor-pointer flex items-center justify-center rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors ${
              isSelected
                ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 dark:ring-offset-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <icon.icon className='size-6' />
          </button>
        )
      })}
    </div>
  )
}
