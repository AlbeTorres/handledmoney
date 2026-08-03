'use client'

import { deleteTransactionAction } from '@/actions/transaction/delete-transaction'
import { TransactionStatusBadge } from '@/components/TransactionStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getTransactionTypeConfig } from '@/lib/transaction-types'
import { fmtDate, formatMoney, getIconComponent } from '@/lib/utils'
import { ArrowBigDown, ArrowBigUp, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'

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
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const typeConfig = getTransactionTypeConfig(type)
  const prefix = type === 'income' ? tTx('amount.income_prefix') : tTx('amount.expense_prefix')

  const Icon = getIconComponent(account.icon ?? 'account_balance')

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res = await deleteTransactionAction({ id })
        if (res.success) {
          toast.success(tTx('form.delete_success'))
          router.push('/transaction')
        } else {
          toast.error(tTx('delete.error_generic'))
        }
      } catch {
        toast.error(tTx('delete.error_generic'))
      }
    })
  }

  return (
    <section className='bg-background'>
      <div className='flex items-end justify-end gap-3'>
        <Link
          className='flex items-center gap-2 bg-primary text-white hover:bg-secondary transition-all duration-300 px-4 py-2 rounded-md text-sm  shadow-lg shadow-primary/20 hover:scale-105'
          href={`/transaction/${id}/edit`}
        >
          {t('edit')}
        </Link>

        <Button variant='destructive'>
          <Trash className='size-4' />
          {tTx('row.delete_transaction')}
        </Button>
      </div>

      <div className='flex mt-5 w-full justify-between items-center'>
        <div>
          <div className='flex flex-wrap items-center  gap-2'>
            <Badge className='text-xs' variant={typeConfig.variant}>
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
            className={`text-5xl tracking-tight font-bold ${
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
