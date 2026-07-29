import { getBankAccountByUserAction } from '@/actions/account/get-account'
import { getCategoriesByUserAction } from '@/actions/category/get-categories'
import { getTransactionsPaginatedAction } from '@/actions/transaction/get-transaction'
import TransactionActionBar from '@/components/TransactionActionBar'
import { TransactionList } from '@/components/TransactionList'
import { TransactionSummaryCards } from '@/components/TransactionSummaryCards'

interface TransactionPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TransactionPage({ searchParams }: TransactionPageProps) {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const limit = Number(resolvedSearchParams.limit) || 50
  const search = (resolvedSearchParams.search as string) || ''

  const [transactionResult, categoryResult, accountResult] = await Promise.all([
    getTransactionsPaginatedAction({ page, limit, search }),
    getCategoriesByUserAction(),
    getBankAccountByUserAction(),
  ])

  const transactions = transactionResult.data?.transactions || []
  const totalPages = transactionResult.data?.totalPages || 0
  const currentPage = transactionResult.data?.currentPage || 1

  const categories = (categoryResult.data || []).map(cat => ({
    id: cat.id,
    name: cat.name,
  }))

  const accounts = accountResult.data || []

  // Calculate summary totals from ALL transactions (not just current page)
  // For now, we calculate from current page data
  // TODO: Add a separate action for summary totals in the future
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const netBalance = totalIncome - totalExpenses

  return (
    <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
      <TransactionSummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netBalance={netBalance}
      />
      <TransactionActionBar categories={categories} transactions={transactions} />
      <TransactionList data={transactions} totalPages={totalPages} currentPage={currentPage} />
    </div>
  )
}
