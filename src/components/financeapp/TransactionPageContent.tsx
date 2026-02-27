'use client'

import { CSVTransaction, Transaction, VARIANTS } from './interfaces'

import { useSelectAccount } from '@/hooks/use-select-account'
import { useCSVState } from '@/store/CSVState'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ImportCard } from './ImportCard'
import { TransactionTable } from './TransactionTable'
import { UploadButton } from './UploadButton'

type Props = {
  data: Transaction[]
}

export const TransactionPageContent = ({ data }: Props) => {
  const { importResult, isImporting, setResults, onCancelImport } = useCSVState()

  const [AccountDialog, confirm] = useSelectAccount()

  const onSubmitImport = async (values: CSVTransaction[]) => {
    const accountId = await confirm()

    if (!accountId) {
      return toast.error('Please select an account to continue.')
    }

    const data = values.map(value => ({ ...value, accountId: accountId as string }))

    const response = {
      data: [],
      error: null,
      meta: {},
    }

    if (response.error !== null) {
      console.log(response.error)
      toast.error('Something went wrong!')
    } else {
      toast.success(`${response.data.length} transactions created successfully!`)
      console.log(response)
      onCancelImport()
    }
  }

  const onCancelImportFunction = () => {
    setResults({ data: [], errors: [], meta: {} })
    onCancelImport()
  }

  if (isImporting === VARIANTS.IMPORT) {
    return (
      <>
        <AccountDialog />
        <ImportCard
          data={importResult.data}
          onCancel={onCancelImportFunction}
          onSubmit={onSubmitImport}
        />
      </>
    )
  }

  return (
    <div className='max-w-screen-2xl mx-auto w-full pb-10 -mt-24'>
      <Card className='border-none drop-shadow-sm'>
        <CardHeader className='gap-y-2 lg:flex-row lg:items-center lg:justify-between'>
          <CardTitle className='text-xl line-clamp-1'>Transactions History</CardTitle>
          <div className='flex items-center lg:flex-row flex-col gap-2'>
            {/* <OpenSheetButton sheet='transaction' /> */}
            <UploadButton />
          </div>
        </CardHeader>
        <CardContent>
          <TransactionTable data={data} />
        </CardContent>
      </Card>
    </div>
  )
}
