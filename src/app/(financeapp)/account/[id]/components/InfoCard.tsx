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
    <div className='bg-card p-6 rounded-xl border border-border'>
      <div className='flex justify-between items-start mb-4'>
        <span className={`text-xs font-bold text-muted-foreground uppercase`}>{title}</span>
        {icon}
      </div>
      <h3
        className={cn(`text-2xl font-extrabold tracking-tight text-foreground`, {
          'text-income': category === 'income',
          'text-expense': category === 'expense',
        })}
      >
        {sign}
        {fmt(value)}
      </h3>
    </div>
  )
}