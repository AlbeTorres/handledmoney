'use client'

import { removeBankAccount } from '@/actions/account/delete-account'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface DeleteAccountDialogProps {
  id: string
  name: string
  isOpen: boolean
  onClose: () => void
  hasTransactions: boolean
  otherAccounts: { id: string; name: string }[]
}

export function DeleteAccountDialog({
  id,
  name,
  isOpen,
  onClose,
  hasTransactions,
  otherAccounts,
}: DeleteAccountDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const [transferToAccountId, setTransferToAccountId] = useState<string | undefined>()
  const t = useTranslations('handledmoney.account')

  const onDelete = async () => {
    if (hasTransactions && !transferToAccountId) {
      toast.error(t('delete.error_no_transfer'))
      return
    }

    setIsPending(true)
    try {
      const res = await removeBankAccount({ id, transferToAccountId })
      if (res.success) {
        toast.success(res.message)
        onClose()
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error(t('delete.error_generic'))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('delete.title')}</DialogTitle>
          <DialogDescription>
            {t('delete.description', { name })}
          </DialogDescription>
        </DialogHeader>

        {hasTransactions && (
          <div className='py-4 space-y-4'>
            <p className='text-sm text-amber-600 font-medium'>
              {t('delete.has_transactions_warning')}
            </p>
            <div className='space-y-2'>
              <label className='text-sm font-semibold'>{t('delete.transfer_to')}</label>
              <Select onValueChange={setTransferToAccountId} value={transferToAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('delete.select_account')} />
                </SelectTrigger>
                <SelectContent>
                  {otherAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {!hasTransactions && (
          <div className='py-4'>
            <p className='text-sm text-slate-500'>{t('delete.no_transactions')}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isPending}>
            {t('delete.cancel')}
          </Button>
          <Button variant='destructive' onClick={onDelete} disabled={isPending}>
            {isPending ? t('delete.deleting') : t('delete.confirm_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
