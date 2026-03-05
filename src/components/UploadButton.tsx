'use client'
import { Button } from '@/components/ui/button'
import { useCSVState } from '@/store'
import { Upload } from 'lucide-react'
import { useCSVReader } from 'react-papaparse'
import { IMPORT_RESULT } from '../interfaces'

export const UploadButton = () => {
  const { CSVReader } = useCSVReader()
  const { onImport, setResults } = useCSVState()

  //TODO: add a paywall

  const onUpload = (results: IMPORT_RESULT) => {
    setResults(results)
    onImport()
  }

  return (
    <CSVReader onUploadAccepted={onUpload}>
      {({ getRootProps }: any) => (
        <Button size='sm' className='w-full lg:w-auto' {...getRootProps()}>
          <Upload className='size-4 mr-2' />
          Import
        </Button>
      )}
    </CSVReader>
  )
}
