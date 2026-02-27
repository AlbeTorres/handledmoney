import { fmt, getIconComponent } from '@/lib/utils'

import { Download } from 'lucide-react'
import { Breadcrumb } from './Breadcrumb'
import { Account } from './financeapp/interfaces/Account'
import { Button } from './ui/button'

type AccountInfoProps = {
  account: Account
}

export const AccountInfo = ({ account }: AccountInfoProps) => {
  const Icon = getIconComponent(account.icon ?? 'account_balance')

  return (
    <header className='sticky top-0 z-10 flex flex-col bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'>
      <div className='flex items-center justify-between px-8 py-4 container mx-auto'>
        <Breadcrumb pathTitle={account.name || ''} oldPath='/account' oldPathTitle='Accounts' />
      </div>
      <div className='px-8 pb-8 pt-2 flex flex-col md:flex-row justify-between container mx-auto items-center sm:items-end gap-6'>
        <div className='flex items-center gap-6'>
          <div className='size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner'>
            <Icon className='size-10' />
          </div>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <p className='text-xs font-bold text-primary uppercase tracking-widest'>
                {account.bank}
              </p>
              <span className='size-1.5 bg-emerald-500 rounded-full'></span>
            </div>
            <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white'>
              {account.name}
            </h1>
            <p className='text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide capitalize'>
              {account.type}
            </p>
          </div>
        </div>
        <div className='text-right'>
          <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>
            Current Balance
          </p>
          <div className='flex items-baseline justify-end gap-1'>
            <span className='text-4xl font-black text-slate-900 dark:text-white'>
              {fmt(Number(account.balance) || 0)}
            </span>
            <span className='text-sm font-bold text-slate-400 ml-2'>{account.currency}</span>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Button>
            <Download className='size-4' />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
