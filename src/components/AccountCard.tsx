import { LucideIcon, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export interface AccountCardProps {
  id: string
  institution: string
  name: string
  balance: string
  decimal?: string
  currency: string
  detail: string
  status: string
  statusVariant: 'active' | 'live' | 'due'
  accentColor: string
  Icon: LucideIcon
  onEdit?: () => void
  onDelete?: () => void
  onDetails?: () => void
}

export function AccountCard({
  id,
  institution,
  name,
  balance,
  decimal = '.00',
  currency,
  detail,
  status,
  statusVariant,
  accentColor,
  Icon,
  onEdit,
  onDelete,
  onDetails,
}: AccountCardProps) {
  const statusColors =
    statusVariant === 'due' ? 'bg-amber-500 text-amber-500' : 'bg-emerald-500 text-emerald-500'

  return (
    <div
      className={`group bg-white dark:bg-slate-900 rounded-xl border-l-4 border-y border-r border-slate-200 dark:border-slate-800 p-6 transition-all relative`}
      style={{ borderLeftColor: accentColor }}
    >
      <div className='flex justify-between items-start mb-6'>
        <div
          className='size-12 rounded-xl flex items-center justify-center'
          style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
        >
          <Icon className='size-7' />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className='text-slate-400 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded outline-none p-1 cursor-pointer'
              aria-label='Account options'
              onClick={e => e.stopPropagation()}
            >
              <MoreVertical className='size-5 ' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation()
                onDetails?.()
              }}
            >
              Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation()
                onEdit?.()
              }}
            >
              Edit Account
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              onClick={e => {
                e.stopPropagation()
                onDelete?.()
              }}
            >
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <p className='text-[9px] font-semibold text-slate-400 uppercase tracking-widest'>
          {institution}
        </p>
        <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-4'>{name}</h3>
        <div className='flex text-2xl gap-x-2'>
          <p className=' font-medium uppercase tracking-wider'>{detail}</p>
          <p>**** **** 8869</p>
        </div>
      </div>
      <div className='mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 w-full'>
        <div className='flex items-baseline gap-1 tabular-nums'>
          <div className='flex items-center gap-2 justify-between w-full'>
            <div>
              <p className='text-2xl font-extrabold'>{balance}</p>
            </div>
            <p
              style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
              className='text-xs font-medium p-2 rounded-md text-slate-400'
            >
              {currency}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
