import { MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type DropdownAction = {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive'
}

interface DropDownActionMenuProps {
  ariaLabel: string
  actions: DropdownAction[]
}

export function DropDownActionMenu({ ariaLabel, actions }: DropDownActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className='text-slate-400 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded outline-none p-1 cursor-pointer'
          aria-label={ariaLabel}
          onClick={e => e.stopPropagation()}
        >
          <MoreVertical className='size-5 ' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {actions.map(action => (
          <DropdownMenuItem
            key={action.label}
            variant={action.variant}
            onClick={e => {
              e.stopPropagation()
              action.onClick()
            }}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
