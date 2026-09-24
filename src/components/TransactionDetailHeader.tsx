'use client'

import { Badge } from '@/components/ui/badge'
import { getTransactionTypeConfig } from '@/lib/transaction-types'
import { fmtDate, formatMoney, getIconComponent } from '@/lib/utils'
import { ArrowBigDown, ArrowBigUp, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TransactionDetailHeaderProps {
  type: 'income' | 'expense'
  amount: string | null
  payee: string
  date: Date
  account: { bank: string; name: string; currency: string; icon?: string }
}

function AccountLine({ icon: Icon, bank, name }: { icon: LucideIcon; bank: string; name: string }) {
  return (
    <div className='flex items-center gap-2 mt-2'>
      <Icon className='size-5 text-muted-foreground shrink-0' />
      <p className='text-sm text-muted-foreground truncate'>
        {bank} · {name}
      </p>
    </div>
  )
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

  const accountIcon = getIconComponent(account.icon ?? 'account_balance')

  return (
    <section className='bg-background'>
      <div className='flex flex-col md:flex-row mt-5 justify-between items-center gap-6'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant={typeConfig.variant}>
              {type === 'income' ? <ArrowBigUp /> : <ArrowBigDown />}
              {t(typeConfig.labelKey)}
            </Badge>
            <p className='mt-1 text-sm text-muted-foreground'>{fmtDate(date)}</p>
          </div>

          <div className='py-2'>
            <h1 className='text-3xl sm:text-4xl font-semibold tracking-tight text-foreground break-words'>
              {payee}
            </h1>
            <AccountLine icon={accountIcon} bank={account.bank} name={account.name} />
          </div>
        </div>

        <div className='flex flex-col items-start md:items-end gap-4'>
          <p
            className={`text-3xl sm:text-4xl tracking-tighter font-bold tabular-nums ${
              type === 'income' ? 'text-income' : 'text-expense'
            }`}
          >
            {prefix}
            {formatMoney(amount ?? '0', account.currency)}
          </p>
        </div>
      </div>
    </section>
  )
}
