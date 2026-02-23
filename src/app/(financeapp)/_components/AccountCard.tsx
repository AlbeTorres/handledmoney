import { ReactNode } from 'react'

export interface AccountCardProps {
  institution: string
  name: string
  balance: string
  decimal?: string
  currency: string
  detail: string
  status: string
  statusVariant: 'active' | 'live' | 'due'
  accentColor: string
  icon: ReactNode
}

export function AccountCard({
  institution,
  name,
  balance,
  decimal = '.00',
  currency,
  detail,
  status,
  statusVariant,
  accentColor,
  icon,
}: AccountCardProps) {
  const statusColors =
    statusVariant === 'due' ? 'bg-amber-500 text-amber-500' : 'bg-emerald-500 text-emerald-500'

  return (
    <div
      className={`group bg-white dark:bg-slate-900 rounded-xl border-l-4 border-y border-r border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all cursor-pointer`}
      style={{ borderLeftColor: accentColor }}
    >
      <div className='flex justify-between items-start mb-6'>
        <div
          className='size-12 rounded-xl flex items-center justify-center'
          style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
        >
          {icon}
        </div>
        <button
          className='text-slate-400 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded outline-none'
          aria-label='Account options'
        >
          <span className='material-symbols-outlined' aria-hidden='true'>
            more_vert
          </span>
        </button>
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
