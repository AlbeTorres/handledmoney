import { AccountTransactionTable } from '@/components/AccountTransactionTable'
import { auth } from '@/lib/auth'
import { fmt } from '@/lib/utils'
import { getBankAccountById } from '@/repository/account'
import { getTransactionsByAccountId } from '@/repository/transaction'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRightLeft,
  ArrowUp,
  Download,
  Landmark,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface AccountPageProps {
  params: Promise<{ id: string }>
}

export default async function AccountPage({ params }: AccountPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/auth/login')
  }

  const resolvedParams = await params
  const { id } = resolvedParams

  const [account] = (await getBankAccountById(id, session.user.id)) || []

  if (!account) {
    redirect('/account')
  }

  const transactions = await getTransactionsByAccountId(id, session.user.id)

  const incomeTransactions = transactions.filter(t => Number(t.amount) > 0)
  const expenseTransactions = transactions.filter(t => Number(t.amount) < 0)

  const totalIncome = incomeTransactions.reduce((acc, t) => acc + Number(t.amount), 0)
  const totalExpenses = Math.abs(expenseTransactions.reduce((acc, t) => acc + Number(t.amount), 0))
  const netFlow = totalIncome - totalExpenses

  // Calculate average daily spend assuming it's over 30 days for this demo, or based on the transactions
  // we'll just mock 30 days since there might be no transactions.
  const avgDailySpend = totalExpenses > 0 ? totalExpenses / 30 : 0

  return (
    <div className='bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-display'>
      <div className='flex h-screen overflow-hidden'>
        <main className='flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark/50'>
          <header className='sticky top-0 z-10 flex flex-col bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'>
            <div className='flex items-center justify-between px-8 py-4'>
              <div className='flex items-center gap-4'>
                <Link
                  href='/account'
                  className='size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors'
                >
                  <ArrowLeft className='size-5' />
                </Link>
                <div>
                  <h2 className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                    Accounts /{' '}
                    <span className='text-slate-900 dark:text-white font-bold'>{account.name}</span>
                  </h2>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <button className='flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-all'>
                  <Download className='size-4' />
                  <span>Export CSV</span>
                </button>
                <button className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20'>
                  <RefreshCw className='size-4' />
                  <span>Sync Bank</span>
                </button>
              </div>
            </div>

            <div className='px-8 pb-8 pt-2 flex flex-col md:flex-row justify-between items-end gap-6'>
              <div className='flex items-center gap-6'>
                <div className='size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner'>
                  <Landmark className='size-10' />
                </div>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <p className='text-xs font-bold text-primary uppercase tracking-widest'>
                      {account.bank}
                    </p>
                    <span className='size-1.5 bg-emerald-500 rounded-full'></span>
                  </div>
                  <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white'>
                    {account.name}
                  </h1>
                  <p className='text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide capitalize'>
                    {account.type}
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>
                  Current Balance
                </p>
                <div className='flex items-baseline justify-end gap-1'>
                  <span className='text-4xl font-black text-slate-900 dark:text-white'>
                    {fmt(Number(account.balance) || 0)}
                  </span>
                  <span className='text-sm font-bold text-slate-400 ml-2'>{account.currency}</span>
                </div>
              </div>
            </div>
          </header>

          <div className='p-8 space-y-8 max-w-[1400px] mx-auto w-full'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
                <div className='flex justify-between items-start mb-4'>
                  <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'>
                    Total Income
                  </span>
                  <ArrowDown className='size-4 text-emerald-500' />
                </div>
                <h3 className='text-2xl font-extrabold tracking-tight text-emerald-500'>
                  +{fmt(totalIncome)}
                </h3>
              </div>

              <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
                <div className='flex justify-between items-start mb-4'>
                  <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'>
                    Total Expenses
                  </span>
                  <ArrowUp className='size-4 text-rose-500' />
                </div>
                <h3 className='text-2xl font-extrabold tracking-tight text-rose-500'>
                  -{fmt(totalExpenses)}
                </h3>
              </div>

              <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
                <div className='flex justify-between items-start mb-4'>
                  <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'>
                    Net Flow
                  </span>
                  <ArrowRightLeft className='size-4 text-primary' />
                </div>
                <h3 className='text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white'>
                  {netFlow > 0 ? '+' : ''}
                  {fmt(netFlow)}
                </h3>
              </div>

              <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
                <div className='flex justify-between items-start mb-4'>
                  <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'>
                    Avg Daily Spend
                  </span>
                  <TrendingUp className='size-4 text-slate-400' />
                </div>
                <h3 className='text-2xl font-extrabold tracking-tight'>{fmt(avgDailySpend)}</h3>
              </div>
            </div>

            <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6'>
              <h3 className='font-bold text-lg mb-4'>Transactions for {account.name}</h3>
              <AccountTransactionTable data={transactions as any} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
