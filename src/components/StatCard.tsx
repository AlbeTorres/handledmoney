import { TrendingUp } from 'lucide-react'
import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  badge?: string
  badgeVariant?: 'positive' | 'negative'
  footer?: ReactNode
}

const TRENDING_ICON = <TrendingUp aria-hidden='true' />

export function StatCard({
  label,
  value,
  badge,
  badgeVariant = 'positive',
  footer,
}: StatCardProps) {
  const badgeColors =
    badgeVariant === 'positive'
      ? 'bg-emerald-500/10 text-emerald-500'
      : 'bg-rose-500/10 text-rose-500'

  return (
    <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
      <div className='flex justify-between items-start mb-4'>
        <span className='text-sm font-medium text-slate-500 dark:text-slate-400'>{label}</span>
        {badge && (
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${badgeColors}`}>{badge}</span>
        )}
      </div>
      <h3 className='text-3xl font-extrabold tracking-tight tabular-nums'>{value}</h3>
      {footer && (
        <div className='text-xs text-slate-400 mt-2 flex items-center gap-1'>
          {label === 'Total Net Worth' && TRENDING_ICON}
          {footer}
        </div>
      )}
    </div>
  )
}
