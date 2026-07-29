'use client'

import { fmt } from '@/lib/utils'
import { ArrowDown, ArrowUp, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TransactionSummaryCardsProps {
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

export function TransactionSummaryCards({
  totalIncome,
  totalExpenses,
  netBalance,
}: TransactionSummaryCardsProps) {
  const t = useTranslations('handledmoney.transaction')

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      {/* Total Income */}
      <div
        data-testid='summary-income'
        className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between h-32 shadow-sm hover:shadow-md transition-shadow'
      >
        <div className='flex justify-between items-start'>
          <span className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest'>
            {t('summary.total_income')}
          </span>
          <div className='size-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400'>
            <ArrowDown className='size-4' />
          </div>
        </div>
        <p className='text-2xl font-extrabold tracking-tight tabular-nums'>
          <span className='text-slate-400 dark:text-slate-500 font-normal'>$</span>
          {fmt(totalIncome)}
        </p>
      </div>

      {/* Total Expenses */}
      <div
        data-testid='summary-expenses'
        className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between h-32 shadow-sm hover:shadow-md transition-shadow'
      >
        <div className='flex justify-between items-start'>
          <span className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest'>
            {t('summary.total_expenses')}
          </span>
          <div className='size-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400'>
            <ArrowUp className='size-4' />
          </div>
        </div>
        <p className='text-2xl font-extrabold tracking-tight tabular-nums'>
          <span className='text-slate-400 dark:text-slate-500 font-normal'>$</span>
          {fmt(totalExpenses)}
        </p>
      </div>

      {/* Net Balance */}
      <div
        data-testid='summary-balance'
        className='bg-white dark:bg-slate-900 rounded-xl border border-primary/10 p-6 flex flex-col justify-between h-32 shadow-sm hover:shadow-md transition-shadow'
      >
        <div className='flex justify-between items-start'>
          <span className='text-xs font-semibold text-primary uppercase tracking-widest'>
            {t('summary.net_balance')}
          </span>
          <div className='size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
            <Wallet className='size-4' />
          </div>
        </div>
        <p className='text-2xl font-extrabold tracking-tight tabular-nums'>
          <span className='text-slate-400 dark:text-slate-500 font-normal'>$</span>
          {fmt(netBalance)}
        </p>
      </div>
    </div>
  )
}
