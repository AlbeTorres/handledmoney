'use client'
import { deleteTransactionAction } from '@/actions/transaction/delete-transaction'
import { useConfirm } from '@/hooks/use-confirm'
import { Pencil, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import toast from 'react-hot-toast'
import { Button } from './ui/button'

interface TransactionDetailActionsProps {
  id: string
}

export default function TransactionDetailActions({ id }: TransactionDetailActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [ConfirmDialog, confirm] = useConfirm(
    'Delete transaction',
    'Are you sure you want to delete this transaction?',
  )

  const t = useTranslations('handledmoney.transaction')

  const handleDelete = async () => {
    const ok = await confirm()
    if (!ok) return
    startTransition(async () => {
      try {
        const res = await deleteTransactionAction({ id })
        if (res.success) {
          toast.success(t('form.delete_success'))
          router.push('/transaction')
        } else {
          toast.error(t('delete.error_generic'))
        }
      } catch {
        toast.error(t('delete.error_generic'))
      }
    })
  }

  return (
    <div className='flex items-end justify-end gap-3'>
      <ConfirmDialog />
      <Link
        className='flex items-center gap-2 bg-primary text-white hover:bg-secondary transition-all duration-300 px-4 py-2 rounded-md text-sm  shadow-lg shadow-primary/20 hover:scale-105'
        href={`/transaction/${id}/edit`}
      >
        <Pencil className='size-4' />
        {'Edit'}
      </Link>

      <Button variant='destructive' disabled={isPending} onClick={handleDelete}>
        <Trash className='size-4' />
      </Button>
    </div>
  )
}
