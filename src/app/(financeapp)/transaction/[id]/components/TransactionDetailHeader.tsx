'use client'

import { TransactionStatusBadge } from './TransactionStatusBadge'
import { Badge } from '@/components/ui/badge'
import { ICONS } from '@/lib/data'
import { getTransactionTypeConfig } from '@/lib/transaction-types'
import { fmtDate, formatMoney } from '@/lib/utils'
import { ArrowBigDown, ArrowBigUp, Landmark } from 'lucide-react'
import { useTranslations } from 'next-intl'

const HeaderIconByKey = new Map<string, typeof Landmark>(ICONS.map(i => [i.name, i.icon]))
const DEFAULT_HEADER_ICON = Landmark

function headerGlyph(iconName: string | undefined) {
  const Icon =
    (iconName && HeaderIconByKey.get(iconName)) || (ICONS[0]?.icon ?? DEFAULT_HEADER_ICON)
  return <Icon className='size-5 text-muted-foreground' />
}

interface TransactionDetailHeaderProps {
  type: 'income' | 'expense'
  amount: string | null
  payee: string
  date: Date
  account: { bank: string; name: string; currency: string; icon?: string }
}

export function TransactionDetailHeader({
  type,
  amount,
  payee,
  date,
  account,
}: TransactionDetailHeaderProps) {
  const t = useTranslations('handledmoney.transaction')

  const typeConfig = getTransactionTypeConfig(type)
  const prefix = type === 'income' ? t('amount.income_prefix') : t('amount.expense_prefix')

  return (
    <section className='bg-background'>
      <div className='flex flex-col md:flex-row  mt-5  justify-between items-center'>
        <div>
          <div className='flex flex-wrap items-center  gap-2'>
            <Badge variant={typeConfig.variant}>
              {type === 'income' ? <ArrowBigUp /> : <ArrowBigDown />}
              {t(typeConfig.labelKey)}
            </Badge>
            <p className='mt-1 text-sm text-muted-foreground'>{fmtDate(date)}</p>
          </div>

          <div className='py-2'>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>{payee}</h1>
            <div className='flex items-center gap-2 mt-2'>
              {headerGlyph(account.icon)}
              <p className='mt-0.5 text-sm text-muted-foreground'>
                {account.bank} · {account.name}
              </p>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-end gap-4'>
          <p
            className={`text-3xl font-bold tracking-tighter ${
              type === 'income' ? 'text-income' : 'text-expense'
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
