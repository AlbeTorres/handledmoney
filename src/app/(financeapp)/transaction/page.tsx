import { getTransactionsPaginatedAction } from '@/actions/transaction/get-transaction'
import { TransactionPageContent } from '@/components/TransactionPageContent'

interface TransactionPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TransactionPage({ searchParams }: TransactionPageProps) {
  const resolvedSearchParams = await searchParams
  const activeTab = (resolvedSearchParams.tab as 'expense' | 'income') || 'expense'
  const page = Number(resolvedSearchParams.page) || 1
  const limit = Number(resolvedSearchParams.limit) || 50
  const search = resolvedSearchParams.search || ''

  const { data } = await getTransactionsPaginatedAction({
    type: activeTab,
    page,
    limit,
    search: '',
  })

  const transactions = data?.transactions || []
  const totalPages = data?.totalPages || 0
  const currentPage = data?.currentPage || 1

  return (
    <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
      <TransactionPageContent
        data={transactions}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  )
}
