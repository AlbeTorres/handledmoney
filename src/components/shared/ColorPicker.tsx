'use client'

interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
}

const PRESET_COLORS = [
  { hex: '137FEC', label: 'Blue' },
  { hex: '10B981', label: 'Emerald' },
  { hex: 'F43F5E', label: 'Rose' },
  { hex: 'F59E0B', label: 'Amber' },
  { hex: '6366F1', label: 'Indigo' },
  { hex: '64748B', label: 'Slate' },
] as const

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const normalizedValue = value.toUpperCase()

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
    onChange(raw)
  }

  return (
    <div className='flex flex-wrap gap-4 items-center'>
      <div role='radiogroup' aria-label='Preset colors' className='flex gap-2'>
        {PRESET_COLORS.map(color => {
          const isSelected = normalizedValue === color.hex
          return (
            <button
              key={color.hex}
              type='button'
              aria-label={`Color ${color.label} (#${color.hex})`}
              aria-pressed={isSelected}
              onClick={() => onChange(color.hex)}
              style={{ backgroundColor: `#${color.hex}`, touchAction: 'manipulation' }}
              className={`size-8 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background ${
                isSelected
                  ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-background'
                  : 'hover:opacity-80'
              }`}
            />
          )
        })}
      </div>

      <div className='h-6 w-px bg-border' aria-hidden='true' />

      <div className='relative flex-1 max-w-[180px]'>
        <span
          aria-hidden='true'
          className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono'
        >
          #
        </span>
        <input
          id='color-hex-input'
          type='text'
          inputMode='text'
          autoComplete='off'
          spellCheck={false}
          value={value}
          onChange={handleHexInput}
          maxLength={6}
          className='w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground uppercase transition-colors'
          aria-label='Custom hex color'
        />
      </div>

      {value.length === 6 && (
        <div
          className='size-8 rounded-full border border-border flex-shrink-0'
          style={{ backgroundColor: `#${value}` }}
          aria-hidden='true'
        />
      )}
    </div>
  )
}
