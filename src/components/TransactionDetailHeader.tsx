'use client'

import { TransactionStatusBadge } from '@/components/TransactionStatusBadge'
import { Badge } from '@/components/ui/badge'
import { getTransactionTypeConfig } from '@/lib/transaction-types'
import { fmtDate, formatMoney, getIconComponent } from '@/lib/utils'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TransactionDetailHeaderProps {
  id: string
  type: 'income' | 'expense'
  amount: string | null
  payee: string
  date: Date
  account: { bank: string; name: string; currency: string; icon?: string }
}

export function TransactionDetailHeader({
  id,
  type,
  amount,
  payee,
  date,
  account,
}: TransactionDetailHeaderProps) {
  const t = useTranslations('handledmoney.transaction.detail')
  const tTx = useTranslations('handledmoney.transaction')

  const typeConfig = getTransactionTypeConfig(type)
  const prefix = type === 'income' ? tTx('amount.income_prefix') : tTx('amount.expense_prefix')

  const Icon = getIconComponent(account.icon ?? 'account_balance')

  return (
    <section className='bg-background'>
      <div className='flex flex-col md:flex-row  mt-5  justify-between items-center'>
        <div>
          <div className='flex flex-wrap items-center  gap-2'>
            <Badge className='rounded-sm text-xs' variant={typeConfig.variant}>
              {type === 'income' ? <ArrowBigUp /> : <ArrowBigDown />}
              {tTx(typeConfig.labelKey)}
            </Badge>
            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>{fmtDate(date)}</p>
          </div>

          <div className='py-2'>
            <h1 className='text-5xl font-semibold tracking-tight  text-slate-900 dark:text-slate-100'>
              {payee}
            </h1>
            <div className='flex items-center gap-2 mt-2'>
              <Icon className='size-5 text-slate-500 dark:text-slate-400' />
              <p className='mt-0.5 text-md text-slate-500 dark:text-slate-400'>
                {account.bank} · {account.name}
              </p>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-end gap-4'>
          <p
            className={`text-5xl tracking-tighter font-bold ${
              type === 'income'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {prefix}
            {formatMoney(amount ?? '0', account.currency)}
          </p>
          <TransactionStatusBadge status='cleared' />
        </div>
      </div>
    </section>
  )
}
