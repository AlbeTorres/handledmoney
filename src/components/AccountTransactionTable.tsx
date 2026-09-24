'use client'
import { deleteTransactionsAction } from '@/actions/transaction/delete-transaction'
import { updateTransactionsCategoryAction } from '@/actions/transaction/update-transactions-category'
import { Transaction } from '@/interfaces'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { DataTable } from './DataTable'

interface AccountTransactionTableProps {
  data: Transaction[]
  categories: { id: string; name: string }[]
  totalPages: number
  currentPage: number
  currency?: string
}

export function AccountTransactionTable({
  data,
  categories,
  totalPages,
  currentPage,
  currency,
}: AccountTransactionTableProps) {
  const t = useTranslations('handledmoney.transaction')
  const router = useRouter()

  async function onDelete(ids: string[]): Promise<boolean> {
    try {
      const result = await deleteTransactionsAction({ ids })
      if (result.success) {
        toast.success(t('table.delete_success', { count: result.count ?? ids.length }))
        return true
      }
      toast.error(t('form.error_generic'))
      return false
    } catch {
      toast.error(t('form.error_generic'))
      return false
    } finally {
      router.refresh()
    }
  }

  async function onBulkCategoryChange(categoryId: string, ids: string[]): Promise<boolean> {
    try {
      const result = await updateTransactionsCategoryAction({ categoryId, ids })
      if (result.success) {
        toast.success(t('table.category_update_success', { count: result.count ?? ids.length }))
        return true
      }
      toast.error(t('table.category_update_error'))
      return false
    } catch {
      toast.error(t('table.category_update_error'))
      return false
    } finally {
      router.refresh()
    }
  }

  return (
    <DataTable
      key={currentPage}
      data={data}
      categories={categories}
      onBulkDelete={onDelete}
      onBulkCategoryChange={onBulkCategoryChange}
      totalPages={totalPages}
      currentPage={currentPage}
      currency={currency}
    />
  )
}
