'use client'

import { useConfirm } from '@/hooks/use-confirm'
import { Transaction } from '@/interfaces'
import { getTransactionTypeConfig } from '@/lib/transaction-types'
import { fmtDate } from '@/lib/utils'
import { Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { BulkCategoryDrawer } from './BulkCategoryDrawer'
import { CategoryColumn } from './CategoryColumn'
import Pagination from './Pagination'
import { Actions } from './actions'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

interface DataTableProps {
  data: Transaction[]
  categories: { id: string; name: string }[]
  onBulkDelete: (ids: string[]) => void
  onBulkCategoryChange: (categoryId: string, ids: string[]) => void
  disabled?: boolean
  totalPages: number
  currentPage: number
}

export function DataTable({
  data,
  categories,
  onBulkDelete,
  onBulkCategoryChange,
  disabled,
  totalPages,
  currentPage,
}: DataTableProps) {
  const t = useTranslations('handledmoney.transaction')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false)

  const [ConfirmDialog, confirm] = useConfirm(
    t('table.confirm_title'),
    t('table.confirm_description'),
  )

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const urlParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) urlParams.delete(key)
        else urlParams.set(key, value)
      })
      return urlParams.toString()
    },
    [searchParams],
  )

  function handlePageChange(page: number) {
    router.push(`?${createQueryString({ page: page.toString() })}`)
  }

  function toggleRow(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleAll() {
    if (data.every(t => selectedIds.has(t.id))) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.map(t => t.id)))
    }
  }

  const isAllSelected = data.length > 0 && data.every(t => selectedIds.has(t.id))
  const isSomeSelected = data.some(t => selectedIds.has(t.id)) && !isAllSelected

  async function handleBulkDelete() {
    const ok = await confirm()
    if (ok) {
      onBulkDelete(Array.from(selectedIds))
      setSelectedIds(new Set())
    }
  }

  function handleBulkCategoryChange(categoryId: string, ids: string[]) {
    onBulkCategoryChange(categoryId, ids)
    setSelectedIds(new Set())
  }

  return (
    <div>
      <ConfirmDialog />
      {/* Bulk action bar */}
      <div className='flex items-center gap-2 py-4'>
        {selectedIds.size > 0 && (
          <>
            <Button
              onClick={handleBulkDelete}
              disabled={disabled}
              size='sm'
              variant='outline'
              className='font-normal text-xs'
            >
              <Trash className='size-4 mr-2' />
              {t('table.delete', { count: selectedIds.size })}
            </Button>
            <Button
              onClick={() => setIsCategoryDrawerOpen(true)}
              disabled={disabled}
              size='sm'
              variant='outline'
              className='font-normal text-xs'
            >
              {t('table.bulk_category', { count: selectedIds.size })}
            </Button>
          </>
        )}
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-10'>
                <Checkbox
                  checked={isAllSelected || (isSomeSelected && 'indeterminate')}
                  onCheckedChange={toggleAll}
                  aria-label={t('table.select_all')}
                />
              </TableHead>
              <TableHead>{t('table.header_date')}</TableHead>
              <TableHead>{t('table.header_type')}</TableHead>
              <TableHead>{t('table.header_amount')}</TableHead>
              <TableHead>{t('table.header_account')}</TableHead>
              <TableHead>{t('table.header_category')}</TableHead>
              <TableHead>{t('table.header_notes')}</TableHead>
              <TableHead className='w-17.5'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map(transaction => {
                const config = getTransactionTypeConfig(transaction.type)
                return (
                  <TableRow
                    key={transaction.id}
                    data-state={selectedIds.has(transaction.id) ? 'selected' : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(transaction.id)}
                        onCheckedChange={() => toggleRow(transaction.id)}
                        aria-label={t('table.select_row')}
                      />
                    </TableCell>
                    <TableCell>{fmtDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{t(config.labelKey)}</Badge>
                    </TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>{transaction.accountName}</TableCell>
                    <TableCell>
                      <CategoryColumn categoryName={transaction.categoryName} />
                    </TableCell>
                    <TableCell>{transaction.notes}</TableCell>
                    <TableCell>
                      <Actions id={transaction.id} />
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className='h-24 text-center'>
                  {t('table.no_results')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex-1 text-sm mt-2 text-muted-foreground'>
        {t('table.rows_selected', {
          selected: selectedIds.size,
          total: data.length,
        })}
      </div>
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        total={totalPages * data.length}
        shown={data.length}
        onPageChange={handlePageChange}
      />

      <BulkCategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        selectedIds={Array.from(selectedIds)}
        categories={categories}
        onSubmit={handleBulkCategoryChange}
      />
    </div>
  )
}
