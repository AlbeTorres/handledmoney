'use client'
import { Button } from '@/components/ui/button'
import { cleanCsvRows } from '@/lib/csv/clean'
import { MAX_IMPORT_ROWS } from '@/lib/csv/constants'
import { useCSVState } from '@/store'
import { Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCSVReader } from 'react-papaparse'
import toast from 'react-hot-toast'
import { IMPORT_RESULT } from '../interfaces'

export const UploadButton = () => {
  const t = useTranslations('handledmoney.transaction')
  const { CSVReader } = useCSVReader()
  const { onImport, setResults } = useCSVState()

  //TODO: add a paywall

  const onUpload = (results: IMPORT_RESULT) => {
    // CSV-IMP-07: a failed parse must never silently continue — surface the
    // papaparse error and stay on LIST.
    if (results.errors.length > 0) {
      toast.error(t('import.upload_parse_error'))
      return
    }

    // CSV-IMP-07 (defect 11): filter trailing empty columns and fully empty
    // rows before the cap check and before mapping.
    const cleaned = cleanCsvRows(results.data)

    // D8: client-side sanity cap. The header row is not a data row, so only
    // count rows below it (mirrors the server-side cap over submitted rows).
    if (cleaned.length - 1 > MAX_IMPORT_ROWS) {
      toast.error(t('import.upload_too_many_rows', { max: MAX_IMPORT_ROWS }))
      return
    }

    setResults({ ...results, data: cleaned })
    onImport()
  }

  return (
    <CSVReader onUploadAccepted={onUpload}>
      {({ getRootProps }: any) => (
        <Button size='sm' className='w-full lg:w-auto' {...getRootProps()}>
          <Upload className='size-4 mr-2' />
          {t('import.upload_button')}
        </Button>
      )}
    </CSVReader>
  )
}
