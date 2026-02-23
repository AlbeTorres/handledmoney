import ExpenseRow from './ExpensesRow'
import Pagination from './Pagination'

type Expense =
  | {
      id: number
      date: string
      time: string
      payee: string
      icon: string
      category: string
      categoryColor: string
      amount: number
      receipt: boolean
      pending?: undefined
    }
  | {
      id: number
      date: string
      time: string
      payee: string
      icon: string
      category: string
      categoryColor: string
      amount: number
      receipt: boolean
      pending: boolean
    }

type Props = {
  data: Expense[]
}

export default function ExpensesTable({ data }: Props) {
  return (
    <div className='bg-white dark:bg-slate-900 rounded-xl border border-primary/10 overflow-hidden shadow-sm'>
      <div className='p-4 border-b border-primary/10 flex justify-between items-center'>
        <h3 className='font-bold text-lg px-2'>Transaction History</h3>
        <div className='flex gap-2'>
          <button className='text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-primary/10 hover:text-primary transition-colors'>
            Export CSV
          </button>
          <button className='text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-primary/10 hover:text-primary transition-colors'>
            Filters
          </button>
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead className='bg-slate-50 dark:bg-slate-800/50'>
            <tr>
              {['Date', 'Payee / Description', 'Category', 'Amount', 'Sales Tax ', 'Receipt'].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${i === 4 ? 'text-center' : ''}`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className='divide-y divide-primary/5'>
            {data.map(tx => (
              <ExpenseRow key={tx.id} tx={tx} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination total={24} shown={data.length} />
    </div>
  )
}
