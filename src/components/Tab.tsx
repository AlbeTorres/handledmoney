'use client'

import { useRef } from 'react'

type Props = {
  activeView: 'expense' | 'income'
  onViewChange: (view: 'expense' | 'income') => void
  tabs: ['income', 'expense']
  labels?: Record<string, string>
  ariaLabel?: string
}

/**
 * Two-option income/expense selector with radiogroup semantics: each option is
 * a radio button, selection is announced via aria-checked and arrow keys move
 * focus and selection like a native radio group.
 */
export const Tab = ({
  activeView,
  onViewChange,
  tabs,
  labels,
  ariaLabel = 'Transaction type',
}: Props) => {
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
    const nextIndex = (index + direction + tabs.length) % tabs.length
    onViewChange(tabs[nextIndex])
    optionRefs.current[nextIndex]?.focus()
  }

  return (
    <div
      role='radiogroup'
      aria-label={ariaLabel}
      className='flex items-center w-fit gap-1 bg-muted p-1 rounded-lg'
    >
      {tabs.map((view, index) => (
        <button
          key={view}
          ref={node => {
            optionRefs.current[index] = node
          }}
          type='button'
          role='radio'
          aria-checked={activeView === view}
          onClick={() => onViewChange(view)}
          onKeyDown={event => onKeyDown(event, index)}
          className={`px-4 py-1.5 w-full rounded-md text-sm font-semibold capitalize transition-colors ${
            activeView === view
              ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {labels?.[view] ?? view}
        </button>
      ))}
    </div>
  )
}
