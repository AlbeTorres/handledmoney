'use client'
import { createTransactionsBulkAction } from '@/actions/transaction/create-transaction'
import { ImportCard } from '@/components/ImportCard'
import { ReviewImportTable, SubmitResult } from '@/components/ReviewImportTable'
import { UploadButton } from '@/components/UploadButton'
import { VARIANTS } from '@/interfaces'
import type { BulkImportInput, RowError } from '@/lib/csv/types'
import { useCSVState } from '@/store/CSVState'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

interface Props {
  accounts: Array<{ id: string; name: string }>
}

/** Full papaparse ParseMeta so the reset matches IMPORT_RESULT (CSV-IMP-07). */
const EMPTY_META = { delimiter: '', linebreak: '', aborted: false, truncated: false, cursor: 0 }

export const CardContainer = ({ accounts }: Props) => {
  const t = useTranslations('handledmoney.transaction')
  const { importResult, isImporting, setResults, onCancelImport, onImport } = useCSVState()

  const onCancelImportFunction = () => {
    setResults({ data: [], errors: [], meta: EMPTY_META })
    onCancelImport()
  }

  /**
   * Submits the review payload (CSV-IMP-01/10). Phase 2 adapter: the action
   * still takes the Phase-1 per-row accountId array, so accountId is injected
   * per row here; task 3.1 swaps the action to `{ accountId, rows }` (D2).
   */
  const onSubmitImport = async (payload: BulkImportInput): Promise<SubmitResult> => {
    const rows = payload.rows.map(row => ({ ...row, accountId: payload.accountId }))

    const response = await createTransactionsBulkAction(rows)

    if (!response.success) {
      if (response.errors) {
        // Old per-row format {index, error} → RowError[] {rowIndex, field, reason}
        const errors: RowError[] = response.errors.map(error => ({
          rowIndex: error.index,
          field: 'unknown',
          reason: error.error,
        }))
        toast.error(t('import.toast_failure'))
        return { success: false, errors }
      }
      toast.error(t('import.toast_failure'))
      return { success: false }
    }

    toast.success(t('import.toast_success', { count: response.data?.length ?? payload.rows.length }))
    onCancelImportFunction()
    return { success: true }
  }

  if (isImporting === VARIANTS.IMPORT) {
    return (
      <div className=''>
        <ImportCard data={importResult.data} accounts={accounts} onCancel={onCancelImportFunction} />
      </div>
    )
  }

  if (isImporting === VARIANTS.REVIEW) {
    return (
      <div className=''>
        <ReviewImportTable onBack={onImport} onSubmit={onSubmitImport} />
      </div>
    )
  }

  return (
    <div>
      <UploadButton />
    </div>
  )
}
