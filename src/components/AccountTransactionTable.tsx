'use client'
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
}

export function AccountTransactionTable({
  data,
  categories,
  totalPages,
  currentPage,
}: AccountTransactionTableProps) {
  const t = useTranslations('handledmoney.transaction')
  const router = useRouter()

  function onDelete(ids: string[]) {
    // TODO: Connect this to actual delete server action if needed
    console.log('Deleting these ids:', ids)
  }

  async function onBulkCategoryChange(categoryId: string, ids: string[]) {
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
