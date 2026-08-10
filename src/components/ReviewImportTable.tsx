'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CSVTransaction } from '@/interfaces'
import { getTransactionTypeConfig } from '@/lib/transaction-types'
import type { BulkImportInput, NormalizedRow, RowError } from '@/lib/csv/types'
import { fmt } from '@/lib/utils'
import { useCSVState } from '@/store'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { BulkTypeDrawer } from './BulkTypeDrawer'

export type SubmitResult = {
  success: boolean
  errors?: RowError[]
}

type Props = {
  onBack: () => void
  onSubmit: (payload: BulkImportInput) => Promise<SubmitResult>
}

/**
 * M5 review screen: normalized rows with per-row flags, bulk selection with an
 * indeterminate select-all, bulk type change and bulk exclusion, and an
 * all-or-nothing submit with a per-row report and retry (CSV-IMP-08/10).
 *
 * rowIndex is 0-based in the store; the UI displays +1.
 */
export const ReviewImportTable = ({ onBack, onSubmit }: Props) => {
  const t = useTranslations('handledmoney.transaction')
  const { config, normalizedRows, excludeRows, setRowType } = useCSVState()

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isTypeDrawerOpen, setIsTypeDrawerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [report, setReport] = useState<RowError[] | null>(null)
  const [lastPayload, setLastPayload] = useState<BulkImportInput | null>(null)

  const includedCount = normalizedRows.filter(row => !row.excluded).length

  const toggleRow = (index: number) =>
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })

  const toggleAll = () => {
    if (normalizedRows.length > 0 && normalizedRows.every((_, index) => selectedIds.has(index))) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(normalizedRows.map((_, index) => index)))
    }
  }

  const isAllSelected =
    normalizedRows.length > 0 && normalizedRows.every((_, index) => selectedIds.has(index))
  const isSomeSelected = normalizedRows.some((_, index) => selectedIds.has(index)) && !isAllSelected

  const handleBulkTypeChange = (type: 'expense' | 'income') => {
    setRowType(Array.from(selectedIds), type)
    setSelectedIds(new Set())
    setIsTypeDrawerOpen(false)
  }

  const handleExclude = () => {
    excludeRows(Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  /** Builds the submit payload: excluded rows are dropped, dates converted at
   *  the payload boundary with local-midnight Date parts (never new Date(raw)). */
  const buildPayload = (): BulkImportInput => ({
    accountId: config.accountId,
    rows: normalizedRows
      .filter(row => !row.excluded)
      .map(toCSVTransaction),
  })

  const handleSubmit = async () => {
    const payload = buildPayload()
    setLastPayload(payload)
    setReport(null)
    setSubmitting(true)
    try {
      const result = await onSubmit(payload)
      if (!result.success) {
        setReport(result.errors ?? [])
      }
    } finally {
      setSubmitting(false)
    }
  }

  // CSV-IMP-10: retry re-submits the unchanged payload from the failed attempt.
  const handleRetry = async () => {
    if (!lastPayload) return
    setReport(null)
    setSubmitting(true)
    try {
      const result = await onSubmit(lastPayload)
      if (!result.success) {
        setReport(result.errors ?? [])
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='max-w-screen-2xl mx-auto w-full pb-10 mt-24'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-xl line-clamp-1 font-semibold'>{t('import.review_title')}</h2>
        <div className='flex items-center gap-2'>
          <Button
            size={'sm'}
            variant='outline'
            onClick={onBack}
            disabled={submitting}
            data-testid='back-to-edit-button'
          >
            {t('import.back_to_edit')}
          </Button>
          <Button size={'sm'} onClick={handleSubmit} disabled={submitting} data-testid='submit-button'>
            {submitting ? t('import.submitting') : `${t('import.submit')} (${includedCount})`}
          </Button>
        </div>
      </div>

      {/* Bulk action bar (M5, mirrors DataTable) */}
      <div className='flex items-center gap-2 py-2'>
        {selectedIds.size > 0 && (
          <>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setIsTypeDrawerOpen(true)}
              disabled={submitting}
              data-testid='bulk-type-button'
            >
              {t('import.bulk_type', { count: selectedIds.size })}
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={handleExclude}
              disabled={submitting}
              data-testid='bulk-exclude-button'
            >
              {t('import.bulk_exclude', { count: selectedIds.size })}
            </Button>
          </>
        )}
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader className='bg-muted'>
            <TableRow>
              <TableHead className='w-10'>
                <Checkbox
                  checked={isAllSelected || (isSomeSelected && 'indeterminate')}
                  onCheckedChange={toggleAll}
                  aria-label={t('import.select_all')}
                />
              </TableHead>
              <TableHead className='w-14'>#</TableHead>
              <TableHead>{t('import.header_date')}</TableHead>
              <TableHead>{t('import.header_payee')}</TableHead>
              <TableHead>{t('import.header_amount')}</TableHead>
              <TableHead>{t('import.header_type')}</TableHead>
              <TableHead>{t('import.header_flags')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {normalizedRows.map((row, index) => {
              const typeConfig = getTransactionTypeConfig(row.type)
              return (
                <TableRow
                  key={index}
                  data-state={selectedIds.has(index) ? 'selected' : undefined}
                  className={row.excluded ? 'opacity-50' : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(index)}
                      onCheckedChange={() => toggleRow(index)}
                      aria-label={t('import.select_row', { row: index + 1 })}
                    />
                  </TableCell>
                  {/* rowIndex 0-based in store; UI shows +1 */}
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    {row.payee || t('import.payee_empty')}
                    {row.excluded && (
                      <Badge variant='outline' className='ml-2'>
                        {t('import.excluded')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{fmt(row.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={typeConfig.variant}>{t(typeConfig.labelKey)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {row.possibleDuplicate && (
                        <Badge variant='outline'>{t('import.flag_duplicate')}</Badge>
                      )}
                      {row.payeeMissing && (
                        <Badge variant='outline'>{t('import.flag_payee_missing')}</Badge>
                      )}
                      {row.typeConflict && (
                        <Badge variant='outline'>{t('import.flag_type_conflict')}</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className='flex-1 text-sm mt-2 text-muted-foreground'>
        {t('import.rows_selected', {
          selected: selectedIds.size,
          total: includedCount,
        })}
      </div>

      {/* Per-row error report + retry (CSV-IMP-09/10) */}
      {report && report.length > 0 && (
        <div className='mt-4 rounded-md border border-destructive/40 p-4' data-testid='import-report'>
          <h3 className='font-semibold'>{t('import.report_title')}</h3>
          <ul className='mt-2 list-inside list-disc text-sm text-destructive'>
            {report.map((error, index) => (
              <li key={index}>
                {t('import.report_row', {
                  row: error.rowIndex + 1,
                  field: error.field,
                  reason: error.reason,
                })}
              </li>
            ))}
          </ul>
          <Button
            size='sm'
            variant='outline'
            className='mt-3'
            onClick={handleRetry}
            disabled={submitting}
            data-testid='retry-button'
          >
            {t('import.retry')}
          </Button>
        </div>
      )}

      <BulkTypeDrawer
        isOpen={isTypeDrawerOpen}
        onClose={() => setIsTypeDrawerOpen(false)}
        selectedCount={selectedIds.size}
        onSubmit={handleBulkTypeChange}
      />
    </div>
  )
}

/** NormalizedRow → CSVTransaction payload row. Date is split into local parts:
 *  `new Date(y, m - 1, d)` — never `new Date('YYYY-MM-DD')` (UTC off-by-one). */
function toCSVTransaction(row: NormalizedRow): CSVTransaction {
  const [year, month, day] = row.date.split('-').map(Number)
  return {
    amount: row.amount,
    payee: row.payee,
    notes: row.notes === '' ? undefined : row.notes,
    date: new Date(year, month - 1, day),
    type: row.type,
  }
}
