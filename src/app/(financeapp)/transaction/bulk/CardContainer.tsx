'use client'
import { createTransactionsBulkAction } from '@/actions/transaction/create-transaction'
import { ImportCard } from '@/components/ImportCard'
import { UploadButton } from '@/components/UploadButton'
import { CSVTransaction, VARIANTS } from '@/interfaces'
import { useCSVState } from '@/store/CSVState'
import toast from 'react-hot-toast'

interface Props {
  accounts: Array<{ id: string; name: string }>
}

export const CardContainer = ({ accounts }: Props) => {
  const { importResult, isImporting, setResults, onCancelImport } = useCSVState()

  const onCancelImportFunction = () => {
    setResults({ data: [], errors: [], meta: {} })
    onCancelImport()
  }

  const onSubmitImport = async (values: CSVTransaction[], accountId: string) => {
    if (!accountId) {
      return toast.error('Please select an account to continue.')
    }

    console.log('values', values)

    const data = values.map(value => ({ ...value, accountId: accountId as string }))

    console.log('data', data)

    const response = await createTransactionsBulkAction(data)

    console.log('response', response)

    if (!response.success) {
      toast.error(response.message)
      if (response.errors !== null) {
        console.log(response.errors)
        toast.error('Something went wrong!')
      }
    } else {
      toast.success(`${response.data?.length} transactions created successfully!`)
      console.log(response)
      onCancelImportFunction()
    }
  }

  if (isImporting === VARIANTS.IMPORT) {
    return (
      <div className=''>
        <ImportCard
          data={importResult.data}
          onCancel={onCancelImportFunction}
          onSubmit={onSubmitImport}
        />
      </div>
    )
  }

  return (
    <div>
      <UploadButton />
    </div>
  )
}
