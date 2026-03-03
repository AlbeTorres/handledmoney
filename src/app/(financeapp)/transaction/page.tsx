import { getTransactionsPaginatedAction } from '@/actions/transaction/get-transaction'
import { TransactionPageContent } from '@/components/TransactionPageContent'

interface TransactionPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TransactionPage({ searchParams }: TransactionPageProps) {
  const resolvedSearchParams = await searchParams
  const activeTab = (resolvedSearchParams.tab as 'expense' | 'income') || 'expense'

  const { data: transactions } = await getTransactionsPaginatedAction({
    type: activeTab,
    page: 1,
    limit: 10,
    search: '',
  })

  if (!transactions) return null

  return (
    <div className='max-w-screen-2xl h-full flex flex-col items-center justify-center mx-auto w-full'>
      <TransactionPageContent data={transactions} />
    </div>
  )
}
