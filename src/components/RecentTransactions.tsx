import { Briefcase, ShoppingCart, Utensils } from 'lucide-react'
import { TransactionRow } from './TransactionRow'

const TRANSACTIONS = [
  {
    icon: <ShoppingCart aria-hidden='true' />,
    entity: 'Apple Store',
    account: 'Sapphire Checking',
    date: 'May 24, 2024',
    amount: '-$1,299.00',
    isExpense: true,
    status: 'Completed',
    statusVariant: 'completed' as const,
  },
  {
    icon: <Briefcase aria-hidden='true' />,
    entity: 'Initech Corp',
    account: 'Sapphire Checking',
    date: 'May 22, 2024',
    amount: '+$4,500.00',
    isExpense: false,
    status: 'Completed',
    statusVariant: 'completed' as const,
  },
  {
    icon: <Utensils aria-hidden='true' />,
    entity: 'Starbucks Coffee',
    account: 'Gold Card',
    date: 'May 21, 2024',
    amount: '-$12.45',
    isExpense: true,
    status: 'Pending',
    statusVariant: 'pending' as const,
  },
]

export function RecentTransactions() {
  return (
    <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden'>
      <div className='p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center'>
        <h3 className='font-bold text-lg'>Recent Transactions</h3>
        <a
          className='text-sm font-bold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded'
          href='#'
        >
          View All
        </a>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left'>
          <thead>
            <tr className='bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider'>
              <th className='px-6 py-4'>Entity</th>
              <th className='px-6 py-4'>Account</th>
              <th className='px-6 py-4'>Date</th>
              <th className='px-6 py-4 text-right'>Amount</th>
              <th className='px-6 py-4 text-center'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
            {TRANSACTIONS.map((tx, index) => (
              <TransactionRow key={index} {...tx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
