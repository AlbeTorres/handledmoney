'use client'

import { fmt } from '@/lib/utils'
import { useTranslations } from 'next-intl'

import { Download, Landmark } from 'lucide-react'
import { Account } from '@/interfaces/Account'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { Button } from '@/components/ui/button'
import { ICONS } from '@/lib/data'

const AccountIconByKey = new Map<string, typeof Landmark>(ICONS.map(i => [i.name, i.icon]))
const DEFAULT_ACCOUNT_ICON = Landmark

function accountGlyph(iconName: string | null | undefined) {
  const Icon = AccountIconByKey.get(iconName ?? 'account_balance') ?? DEFAULT_ACCOUNT_ICON
  return <Icon className='size-10' />
}

type AccountInfoProps = {
  account: Account
}

export const AccountInfo = ({ account }: AccountInfoProps) => {
  const t = useTranslations('handledmoney.account')

  return (
    <header className='flex flex-col bg-background/80 border-b border-border'>
      <div className='flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8 container mx-auto'>
        <Breadcrumb
          pathTitle={account.name || ''}
          oldPath='/account'
          oldPathTitle={t('breadcrumbs.accounts')}
        />
      </div>
      <div className='px-4 pb-8 pt-2 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between container mx-auto items-center sm:items-end gap-6'>
        <div className='flex items-center gap-6'>
          <div className='size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary'>
            {accountGlyph(account.icon)}
          </div>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <p className='text-xs font-bold text-primary uppercase tracking-widest'>
                {account.bank}
              </p>
              <span className='size-1.5 bg-success rounded-full'></span>
            </div>
            <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
              {account.name}
            </h1>
            <p className='text-sm text-muted-foreground font-medium tracking-wide capitalize'>
              {account.type}
            </p>
          </div>
        </div>
        <div className='text-right'>
          <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1'>
            {t('info.current_balance')}
          </p>
          <div className='flex items-baseline justify-end gap-1'>
            <span className='text-4xl font-black text-foreground'>
              {fmt(Number(account.balance) || 0)}
            </span>
            <span className='text-sm font-bold text-muted-foreground ml-2'>{account.currency}</span>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Button>
            <Download className='size-4' />
            <span>{t('info.export_csv')}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
