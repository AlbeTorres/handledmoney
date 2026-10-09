import { EmptyState } from '@/components/shared/EmptyState'
import TransactionActionBar from './components/TransactionActionBar'
import { TransactionList } from './components/TransactionList'
import { getBankAccountByUserAction } from '@/data-access/get-account'
import { getCategoriesByUserAction } from '@/data-access/get-categories'
import { getTransactionsPaginatedAction } from '@/data-access/get-transaction'
import { getTranslations } from 'next-intl/server'

interface TransactionPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TransactionPage({ searchParams }: TransactionPageProps) {
  const t = await getTranslations('handledmoney')

  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const limit = Number(resolvedSearchParams.limit) || 50
  const search = (resolvedSearchParams.search as string) || ''
  const type = resolvedSearchParams.type as 'income' | 'expense' | undefined
  const categoryId = resolvedSearchParams.category as string | undefined
  const sort = resolvedSearchParams.sort as
    | 'date'
    | 'amount_high'
    | 'amount_low'
    | 'recently_added'
    | undefined

  const [transactionResult, categoryResult, accountResult] = await Promise.all([
    getTransactionsPaginatedAction({ page, limit, search, type, categoryId, sort }),
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

  if (!accounts || accounts.length === 0) {
    return (
      <div className='container flex w-full flex-col gap-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{t('breadcrumbs.transactions')}</h1>
          <p className='body-lg mt-1 text-muted-foreground'>
            Review and manage your account movements.
          </p>
        </div>
        <EmptyState
          title={t('account.empty_state.title')}
          description={t('account.empty_state.description')}
          primaryActionText={t('account.empty_state.add_first_account')}
          onPrimaryActionHref='/account/create'
          showImportButton={false}
        />
      </div>
    )
  }

  const hasActiveFilters = !!(search || type || categoryId)

  if (!transactions || transactions.length === 0) {
    if (!hasActiveFilters) {
      return (
        <div className='container flex w-full flex-col gap-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>{t('breadcrumbs.transactions')}</h1>
            <p className='body-lg mt-1 text-muted-foreground'>
              Review and manage your account movements.
            </p>
          </div>
          <EmptyState
            title={t('transaction.empty_state.title')}
            description={t('transaction.empty_state.description')}
            primaryActionText={t('transaction.empty_state.add_first_transaction')}
            onPrimaryActionHref='/transaction/create'
            showImportButton={true}
            importActionText={t('transaction.empty_state.import_data')}
            onImportAction='/transaction/bulk'
          />
        </div>
      )
    }
  }

  return (
    <div className='container flex w-full flex-col gap-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>{t('breadcrumbs.transactions')}</h1>
        <p className='body-lg mt-1 text-muted-foreground'>
          Review and manage your account movements.
        </p>
      </div>
      <TransactionActionBar categories={categories} transactions={transactions} />
      <TransactionList
        data={transactions}
        categories={categories}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  )
}
