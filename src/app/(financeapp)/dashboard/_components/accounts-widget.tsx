import { Banknote, CircleDollarSign, CreditCard, Landmark, PiggyBank, WalletCards, type LucideIcon } from 'lucide-react'

import { type DashboardAccount, type SupportedAccountType } from '@/lib/finance-data'
import { cn } from '@/lib/utils'

const ICONS: Record<SupportedAccountType, LucideIcon> = {
  cash: Banknote,
  savings: PiggyBank,
  checking: Landmark,
  investment: WalletCards,
  credit: CreditCard,
}

const TYPE_LABEL: Record<SupportedAccountType, string> = {
  cash: 'Efectivo',
  savings: 'Ahorros',
  checking: 'Cuenta corriente',
  investment: 'Inversión',
  credit: 'Crédito',
}

function formatAccountBalance(balance: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(balance)
  } catch {
    return `${currency} ${balance.toFixed(2)}`
  }
}

interface Props {
  accounts: DashboardAccount[]
  aggregateBalance: { currency: string; balance: number } | null
}

export function AccountsWidget({ accounts, aggregateBalance }: Props) {

  return (
    <section className='flex h-full flex-col rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md'>
      <div className='flex items-center justify-between border-b border-border px-5 py-4'>
        <h2 className='flex items-center gap-2 text-sm font-semibold'>
          <Landmark className='size-4 text-muted-foreground' />
          Mis Cuentas
        </h2>
        <span className='text-xs text-muted-foreground'>Saldo líquido</span>
      </div>

       {accounts.length === 0 ? (
         <p className='px-5 py-6 text-sm text-muted-foreground'>No hay cuentas para mostrar</p>
       ) : (
       <ul className='flex flex-1 flex-col gap-1.5 px-3 py-3'>
         {accounts.map(account => {
           const Icon = account.type ? ICONS[account.type] : CircleDollarSign
           const negative = account.balance < 0
          return (
            <li
              key={account.id}
              className='flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-muted/50'
            >
              <span className='flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                <Icon className='size-4' />
              </span>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{account.name}</p>
                 <p className='text-xs text-muted-foreground'>
                   {account.type ? TYPE_LABEL[account.type] : 'Cuenta genérica'}
                 </p>
              </div>
              <span
                className={cn(
                  'font-mono text-sm font-semibold tabular-nums',
                  negative ? 'text-danger' : 'text-foreground',
                )}
              >
                 {formatAccountBalance(account.balance, account.currency)}
               </span>
               <span className='sr-only'>{account.currency}</span>
             </li>
          )
        })}
       </ul>
       )}

       {aggregateBalance && (
       <div className='mt-auto flex items-center justify-between rounded-b-xl border-t border-border bg-muted/50 px-5 py-4'>
         <span className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
           Patrimonio neto ({aggregateBalance.currency})
         </span>
         <span className='font-mono text-lg font-semibold tabular-nums'>
           {formatAccountBalance(aggregateBalance.balance, aggregateBalance.currency)}
         </span>
       </div>
       )}
    </section>
  )
}
