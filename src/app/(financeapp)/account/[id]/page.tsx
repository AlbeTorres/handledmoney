import { getBankAccountByIdAction } from '@/actions/account/get-account'
import { getTransactionsPaginatedAction } from '@/actions/transaction/get-transaction'
import { AccountInfo } from '@/components/AccountInfo'
import { AccountTransactionTable } from '@/components/AccountTransactionTable'
import { InfoCard } from '@/components/InfoCard'

import { auth } from '@/lib/auth'
import { ArrowDown, ArrowRightLeft, ArrowUp, TrendingUp } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

interface AccountPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  params: Promise<{ id: string }>
}

export default async function AccountPage({ searchParams, params }: AccountPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/auth/login')
  }

  const resolvedParams = await params
  const { id } = resolvedParams

  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const limit = Number(resolvedSearchParams.limit) || 50
  const search = resolvedSearchParams.search || ''

  const [account, transactions] = await Promise.all([
    getBankAccountByIdAction(id),
    getTransactionsPaginatedAction({
      accountId: id,
      page,
      limit,
      search: '',
    }),
  ])

  const transactionsData = transactions?.data?.transactions || []
  const totalPages = transactions?.data?.totalPages || 0
  const currentPage = transactions?.data?.currentPage || 1

  const { data: accountData } = account

  if (!accountData || !transactionsData) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>Error</p>
      </div>
    )
  }

  const incomeTransactions = transactionsData.filter(t => Number(t.amount) > 0)
  const expenseTransactions = transactionsData.filter(t => Number(t.amount) < 0)

  const totalIncome = incomeTransactions.reduce((acc, t) => acc + Number(t.amount), 0)
  const totalExpenses = Math.abs(expenseTransactions.reduce((acc, t) => acc + Number(t.amount), 0))
  const netFlow = totalIncome - totalExpenses

  // Calculate average daily spend assuming it's over 30 days for this demo, or based on the transactions
  // we'll just mock 30 days since there might be no transactions.
  const avgDailySpend = totalExpenses > 0 ? totalExpenses / 30 : 0

  return (
    <div className='bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-display'>
      <div className='flex  h-screen overflow-hidden'>
        <main className='flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark/50'>
          <AccountInfo account={accountData} />

          <div className='p-8 container space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <InfoCard
                title='Total Income'
                value={totalIncome}
                icon={<ArrowDown className='size-4 text-emerald-500' />}
                category='income'
              />

              <InfoCard
                title='Total Expenses'
                value={totalExpenses}
                icon={<ArrowUp className='size-4 text-rose-500' />}
                category='expense'
              />

              <InfoCard
                title='Net Flow'
                value={netFlow}
                icon={<ArrowRightLeft className='size-4 text-primary' />}
              />

              <InfoCard
                title='Avg Daily Spend'
                value={avgDailySpend}
                icon={<TrendingUp className='size-4 text-slate-400' />}
              />
            </div>

            <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6'>
              <h3 className='font-bold text-lg mb-4'>Transactions for {accountData.name}</h3>
              <AccountTransactionTable
                data={transactionsData}
                totalPages={totalPages}
                currentPage={currentPage}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
