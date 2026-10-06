'use client'
import { IMPORT_RESULT } from '@/interfaces'
import { cleanCsvRows } from '@/lib/csv/clean'
import { MAX_IMPORT_ROWS } from '@/lib/csv/constants'
import { cn } from '@/lib/utils'
import { useCSVState } from '@/store'
import { Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useCSVReader } from 'react-papaparse'
import toast from 'react-hot-toast'

export const UploadDropzone = () => {
  const t = useTranslations('handledmoney.transaction')
  const { CSVReader } = useCSVReader()
  const { onImport, setResults } = useCSVState()
  const [isDragging, setIsDragging] = useState(false)

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
        <div
          {...getRootProps({
            onDragEnter: () => setIsDragging(true),
            onDragLeave: () => setIsDragging(false),
            onDrop: () => setIsDragging(false),
          })}
          tabIndex={0}
          data-testid='upload-dropzone'
          data-dragging={isDragging}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-10 sm:p-16 max-w-xl w-full mx-auto text-center cursor-pointer rounded-xl border-2 border-dashed outline-none transition-all',
            isDragging
              ? 'border-primary bg-primary/5 ring-2 ring-primary'
              : 'border-input bg-background hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary',
          )}
        >
          <Upload className='size-10 text-muted-foreground mb-3' />
          <h2 className='text-lg font-semibold'>{t('import.title')}</h2>
          <p className='text-sm text-muted-foreground'>{t('import.dropzone_drag_hint')}</p>
          <button
            type='button'
            className='mt-3 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2 text-sm font-medium shadow-md shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:scale-105 outline-none'
          >
            {t('import.upload_button')}
          </button>
          <p className='mt-3 text-xs text-muted-foreground'>
            {t('import.dropzone_hint', { max: MAX_IMPORT_ROWS })}
          </p>
        </div>
      )}
    </CSVReader>
  )
}
