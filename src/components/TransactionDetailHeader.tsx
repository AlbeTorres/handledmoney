'use client'

import { deleteTransactionAction } from '@/actions/transaction/delete-transaction'
import { TransactionStatusBadge } from '@/components/TransactionStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getTransactionTypeConfig } from '@/lib/transaction-types'
import { fmtDate, formatMoney } from '@/lib/utils'
import { ArrowLeft, Edit, Trash } from 'lucide-react'
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
  account: { bank: string; name: string; currency: string }
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
  const prefix =
    type === 'income' ? tTx('amount.income_prefix') : tTx('amount.expense_prefix')

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
    <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
      <div className='flex items-center justify-between gap-4'>
        <Link
          href='/transaction'
          aria-label={t('back')}
          className='inline-flex size-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100'
        >
          <ArrowLeft className='size-5' />
        </Link>

        <div className='flex flex-wrap items-center gap-2'>
          {/* PLACEHOLDER: no status column exists yet — replace when schema lands */}
          <TransactionStatusBadge status='cleared' />
          <Badge variant={typeConfig.variant}>{tTx(typeConfig.labelKey)}</Badge>
          <Button asChild variant='outline' size='sm'>
            <Link href={`/transaction/${id}/edit`}>{t('edit')}</Link>
          </Button>
          <Button variant='ghost' size='sm' onClick={() => setOpen(true)}>
            <Trash className='size-4' />
            {tTx('row.delete_transaction')}
          </Button>
        </div>
      </div>

      <div className='mt-5 flex flex-wrap items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{payee}</h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>{fmtDate(date)}</p>
          <p className='mt-0.5 text-sm text-slate-500 dark:text-slate-400'>
            {account.bank} · {account.name}
          </p>
        </div>
        <p
          className={`text-3xl font-bold ${
            type === 'income'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {prefix}
          {formatMoney(amount ?? '0', account.currency)}
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tTx('delete.title')}</DialogTitle>
            <DialogDescription>{tTx('delete.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)} disabled={isPending}>
              {tTx('delete.cancel_button')}
            </Button>
            <Button variant='destructive' onClick={handleDelete} disabled={isPending}>
              {isPending ? tTx('delete.deleting') : tTx('delete.confirm_button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
