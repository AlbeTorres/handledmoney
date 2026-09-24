import { AccountInfo } from '@/components/AccountInfo'
import { AccountTransactionTable } from '@/components/AccountTransactionTable'
import { InfoCard } from '@/components/InfoCard'
import { getBankAccountByIdAction } from '@/data-access/get-account'
import { getCategoriesByUserData } from '@/data-access/get-categories'
import {
  getAccountSummaryAction,
  getTransactionsByAccountIdAction,
  getTransactionsPaginatedAction,
} from '@/data-access/get-transaction'

import { Transaction } from '@/interfaces'
import { auth } from '@/lib/auth'
import { ArrowDown, ArrowRightLeft, ArrowUp, TrendingUp } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
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

  const t = await getTranslations('handledmoney.account')

  const resolvedParams = await params
  const { id } = resolvedParams

  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const limit = Number(resolvedSearchParams.limit) || 50
  const search = resolvedSearchParams.search || ''

  const [account, transactions, categoryResult, allTransactions, accountSummary] =
    await Promise.all([
      getBankAccountByIdAction(id),
      getTransactionsPaginatedAction({
        accountId: id,
        page,
        limit,
        search: '',
      }),
      getCategoriesByUserData(),
      getTransactionsByAccountIdAction(id),
      getAccountSummaryAction(id),
    ])

  const transactionsData = transactions?.data?.transactions || []
  const totalPages = transactions?.data?.totalPages || 0
  const currentPage = transactions?.data?.currentPage || 1

  const categories = (categoryResult.data || []).map(cat => ({
    id: cat.id,
    name: cat.name,
  }))

  // Full transaction history for the CSV export — the table above only shows
  // the current page, so exporting those rows would silently drop every other
  // transaction of the account.
  const exportTransactions: Transaction[] = (allTransactions?.data ?? []).map(row => ({
    id: row.id,
    type: row.type,
    amount: row.amount ?? '',
    payee: row.payee ?? '',
    accountId: row.accountId,
    categoryId: row.categoryId ?? null,
    notes: row.notes ?? null,
    date: row.date,
    userId: row.userId,
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    accountName: row.accountName ?? '',
    categoryName: row.categoryName ?? null,
  }))

  const { data: accountData } = account

  if (!accountData) {
    return (
      <div className='flex min-h-64 items-center justify-center p-8'>
        <p className='text-sm text-muted-foreground'>{t('detail.error')}</p>
      </div>
    )
  }

  // Whole-account aggregates from the summary query: totals cover every
  // transaction (not just the visible page) and the average daily spend is
  // measured over the account's real transaction span instead of a mock 30 days.
  const summary = accountSummary?.data
  const totalIncome = summary?.totalIncome ?? 0
  const totalExpenses = summary?.totalExpenses ?? 0
  const netFlow = totalIncome - totalExpenses
  const spanDays =
    summary?.firstDate && summary.lastDate
      ? Math.max(
          1,
          Math.ceil((summary.lastDate.getTime() - summary.firstDate.getTime()) / 86_400_000),
        )
      : 0
  const avgDailySpend = totalExpenses > 0 && spanDays > 0 ? totalExpenses / spanDays : 0

  return (
    <div className='bg-background text-foreground'>
      <AccountInfo account={accountData} transactions={exportTransactions} />

      <div className='container space-y-8 px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
          <InfoCard
            title={t('detail.total_income')}
            value={totalIncome}
            currency={accountData.currency}
            icon={<ArrowDown className='size-4 text-income' />}
            category='income'
          />

          <InfoCard
            title={t('detail.total_expenses')}
            value={totalExpenses}
            currency={accountData.currency}
            icon={<ArrowUp className='size-4 text-expense' />}
            category='expense'
          />

          <InfoCard
            title={t('detail.net_flow')}
            value={netFlow}
            currency={accountData.currency}
            icon={<ArrowRightLeft className='size-4 text-primary' />}
          />

          <InfoCard
            title={t('detail.avg_daily_spend')}
            value={avgDailySpend}
            currency={accountData.currency}
            icon={<TrendingUp className='size-4 text-muted-foreground' />}
          />
        </div>

        <div className='overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-bold'>
            {t('detail.transactions_for', { name: accountData.name })}
          </h3>
          <AccountTransactionTable
            data={transactionsData}
            categories={categories}
            totalPages={totalPages}
            currentPage={currentPage}
            currency={accountData.currency}
          />
        </div>
      </div>
    </div>
  )
}
