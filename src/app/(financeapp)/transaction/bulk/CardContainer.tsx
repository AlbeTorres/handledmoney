'use client'
import { createTransactionsBulkAction } from '@/actions/transaction/create-transaction'
import { ImportCard } from '@/components/ImportCard'
import { ReviewImportTable, SubmitResult } from '@/components/ReviewImportTable'
import { UploadButton } from '@/components/UploadButton'
import { VARIANTS } from '@/interfaces'
import type { BulkImportInput } from '@/lib/csv/types'
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
   * Submits the review payload (CSV-IMP-01/10). D2: the action takes
   * `{ accountId, rows }` and the server injects accountId per row.
   */
  const onSubmitImport = async (payload: BulkImportInput): Promise<SubmitResult> => {
    const response = await createTransactionsBulkAction(payload)

    if (!response.success) {
      if (response.errors) {
        toast.error(t('import.toast_failure'))
        return { success: false, errors: response.errors }
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
