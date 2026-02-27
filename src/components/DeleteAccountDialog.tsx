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

  const onDelete = async () => {
    if (hasTransactions && !transferToAccountId) {
      toast.error('Please select an account to transfer transactions to.')
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
      toast.error('Something went wrong')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {hasTransactions && (
          <div className='py-4 space-y-4'>
            <p className='text-sm text-amber-600 font-medium'>
              This account has active transactions. You must transfer them to another account before
              deleting.
            </p>
            <div className='space-y-2'>
              <label className='text-sm font-semibold'>Transfer to:</label>
              <Select onValueChange={setTransferToAccountId} value={transferToAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder='Select an account' />
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
            <p className='text-sm text-slate-500'>This account has no transactions.</p>
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onDelete} disabled={isPending}>
            {isPending ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
