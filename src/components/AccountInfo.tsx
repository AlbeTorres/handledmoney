'use client'

import { exportTransactionsToCSV } from '@/lib/export-csv'
import { fmt, getIconComponent } from '@/lib/utils'
import { useTranslations } from 'next-intl'

import { Download } from 'lucide-react'
import { Transaction } from '../interfaces'
import { Account } from '../interfaces/Account'
import { Breadcrumb } from './Breadcrumb'
import { Button } from './ui/button'

type AccountInfoProps = {
  account: Account
  transactions?: Transaction[]
}

export const AccountInfo = ({ account, transactions }: AccountInfoProps) => {
  const t = useTranslations('handledmoney.account')
  const Icon = getIconComponent(account.icon ?? 'account_balance')

  const handleExport = () => {
    if (!transactions?.length) return
    exportTransactionsToCSV(transactions, `${account.name || 'account'}-transactions.csv`)
  }

  return (
    <header className='flex flex-col border-b border-border bg-card/80'>
      <div className='flex items-center justify-between px-4 py-4 container mx-auto sm:px-6 lg:px-8'>
        <Breadcrumb pathTitle={account.name || ''} oldPath='/account' oldPathTitle='Accounts' />
      </div>
      <div className='flex flex-col items-center gap-6 px-4 pb-8 pt-2 container mx-auto sm:items-end md:flex-row md:justify-between sm:px-6 lg:px-8'>
        <div className='flex items-center gap-6'>
          <div className='flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner'>
            <Icon className='size-10' />
          </div>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <p className='text-xs font-bold text-primary uppercase tracking-widest'>
                {account.bank}
              </p>
              <span className='size-1.5 rounded-full bg-income'></span>
            </div>
            <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
              {account.name}
            </h1>
            <p className='text-sm font-medium capitalize tracking-wide text-muted-foreground'>
              {account.type}
            </p>
          </div>
        </div>
        <div className='text-right'>
          <p className='mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
            {t('info.current_balance')}
          </p>
          <div className='flex items-baseline justify-end gap-1'>
            <span className='text-4xl font-black text-foreground'>
              {fmt(Number(account.balance) || 0)}
            </span>
            <span className='ml-2 text-sm font-bold text-muted-foreground'>{account.currency}</span>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            data-testid='export-csv-button'
            disabled={!transactions || transactions.length === 0}
            onClick={handleExport}
          >
            <Download className='size-4' />
            <span>{t('info.export_csv')}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
