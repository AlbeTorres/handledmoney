'use client'
import { updateTransactionsCategoryAction } from '@/actions/transaction/update-transactions-category'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Transaction } from '../interfaces'
import { DataTable } from './DataTable'

interface TransactionListProps {
  data: Transaction[]
  categories: { id: string; name: string }[]
  totalPages: number
  currentPage: number
}

export function TransactionList({
  data,
  categories,
  totalPages,
  currentPage,
}: TransactionListProps) {
  const t = useTranslations('handledmoney.transaction')
  const router = useRouter()

  const onDelete = async (ids: string[]) => {
    try {
      // TODO: Implement bulk delete server action (soft delete)
      console.log('Would delete transactions:', ids)
      toast.success(t('table.delete_success', { count: ids.length }))
    } catch {
      toast.error(t('form.error_generic'))
    }
  }

  const onBulkCategoryChange = async (categoryId: string, ids: string[]) => {
    try {
      const result = await updateTransactionsCategoryAction({ categoryId, ids })
      if (result.success) {
        toast.success(t('table.category_update_success', { count: result.count ?? ids.length }))
      } else {
        toast.error(t('table.category_update_error'))
      }
    } catch {
      toast.error(t('table.category_update_error'))
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
    />
  )
}
