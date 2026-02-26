import { LucideIcon, MoreVertical } from 'lucide-react'
import Link from 'next/link'
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
}: AccountCardProps) {
  const statusColors =
    statusVariant === 'due' ? 'bg-amber-500 text-amber-500' : 'bg-emerald-500 text-emerald-500'

  return (
    <div
      className={`group bg-white dark:bg-slate-900 rounded-xl border-l-4 border-y border-r border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all cursor-pointer relative`}
      style={{ borderLeftColor: accentColor }}
    >
      <div className='flex justify-between items-start mb-6'>
        <Link href={`/account/${id}`}>
          <div
            className='size-12 rounded-xl flex items-center justify-center'
            style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
          >
            <Icon className='size-7' />
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className='text-slate-400 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded outline-none p-1'
              aria-label='Account options'
              onClick={e => e.stopPropagation()}
            >
              <MoreVertical className='size-5' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
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
        <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>
          {institution}
        </p>
        <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>{name}</h4>
        <div className='flex items-baseline gap-1 tabular-nums'>
          <span className='text-2xl font-extrabold'>{balance}</span>
          <span className='text-sm font-bold text-slate-400'>{decimal}</span>
          <span className='text-xs font-medium text-slate-400 ml-1'>{currency}</span>
        </div>
      </div>
      <div className='mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center'>
        <span className='text-xs font-medium text-slate-400'>{detail}</span>
        <span
          className={`text-xs font-bold flex items-center gap-1 ${
            statusVariant === 'due' ? 'text-amber-500' : 'text-emerald-500'
          }`}
        >
          <span className={`size-1.5 rounded-full ${statusColors.split(' ')[0]}`}></span>
          {status}
        </span>
      </div>
    </div>
  )
}
