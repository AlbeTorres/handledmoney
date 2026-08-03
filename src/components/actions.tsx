'use client'

import { deleteTransactionAction } from '@/actions/transaction/delete-transaction'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/hooks/use-confirm'

import { Edit, Eye, MoreHorizontal, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type Props = {
  id: string
}

export const Actions = ({ id }: Props) => {
  const router = useRouter()
  const t = useTranslations('handledmoney.transaction')
  const [ConfirmDialog, confirm] = useConfirm(
    t('form.confirm_delete_title'),
    t('form.confirm_delete_description'),
  )

  const handleDelete = async () => {
    const ok = await confirm()
    if (!ok) return

    try {
      const response = await deleteTransactionAction({ id })
      if (response.success) {
        toast.success(t('form.delete_success'))
        router.refresh()
      } else {
        toast.error(t('form.delete_error'))
      }
    } catch {
      toast.error(t('form.delete_error'))
    }
  }

  return (
    <DropdownMenu>
      <ConfirmDialog />
      <DropdownMenuTrigger asChild>
        <Button variant={'ghost'} className='size-8 p-0'>
          <MoreHorizontal className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          disabled={false}
          onClick={() => router.push(`/transaction/${id}`)}
          className='p-2 cursor-pointer'
        >
          <Eye className='size-4 mr-2' />
          {t('row.view_details')}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={false}
          onClick={() => router.push(`/transaction/${id}/edit`)}
          className='p-2 cursor-pointer'
        >
          <Edit className='size-4 mr-2' />
          {t('form.edit_transaction')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant='destructive'
          onClick={handleDelete}
          className='p-2 cursor-pointer'
        >
          <Trash className='size-4 mr-2' />
          {t('form.delete_transaction')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
