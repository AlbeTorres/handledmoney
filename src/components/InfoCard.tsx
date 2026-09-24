import { cn, fmt, formatMoney } from '@/lib/utils'
import { ReactNode } from 'react'

type InfoCardProps = {
  title: string
  value: number
  icon: ReactNode
  currency?: string
  category?: 'income' | 'expense'
}

export const InfoCard = ({ title, value, icon, currency, category }: InfoCardProps) => {
  let sign = ''

  if (category === 'income') {
    sign = '+'
  } else if (category === 'expense') {
    sign = '-'
  }

  const tone =
    category === 'income'
      ? 'text-income'
      : category === 'expense'
        ? 'text-expense'
        : 'text-foreground'

  return (
    <div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
      <div className='mb-4 flex items-start justify-between'>
        <span className={cn('text-xs font-bold uppercase', tone)}>{title}</span>
        {icon}
      </div>
      <h3 className={cn('text-2xl font-extrabold tracking-tight', tone)}>
        {sign}
        {currency ? formatMoney(value, currency) : fmt(value)}
      </h3>
    </div>
  )
}
