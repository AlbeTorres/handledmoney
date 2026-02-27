import { cn, fmt } from '@/lib/utils'
import { ReactNode } from 'react'

type InfoCardProps = {
  title: string
  value: number
  icon: ReactNode
  category?: 'income' | 'expense'
}

export const InfoCard = ({ title, value, icon, category }: InfoCardProps) => {
  let sign = ''

  if (category === 'income') {
    sign = '+'
  } else if (category === 'expense') {
    sign = '-'
  }

  return (
    <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
      <div className='flex justify-between items-start mb-4'>
        <span
          className={`text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ${category === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}
        >
          {title}
        </span>
        {icon}
      </div>
      <h3
        className={cn(`text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white`, {
          'text-emerald-500': category === 'income',
          'text-rose-500': category === 'expense',
        })}
      >
        {sign}
        {fmt(value)}
      </h3>
    </div>
  )
}
