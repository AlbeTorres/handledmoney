import { INCOME } from '@/lib/data'
import IncomeRow from './IncomeRow'
import Pagination from './Pagination'

type Income = {
  id: number
  date: string
  total: number
  hours: number
  weeks: number
  overtime: number
  taxFederal: number
  fica: number
  medicare: number
  rateHour: number
  gross: number
  rateOT: number
  rateOTpay: number
}

type Props = {
  data: Income[]
}

export default function IncomeTable({ data }: Props) {
  const COLS = [
    'Date',
    'Net Pay',
    'Hours',
    'Weeks',
    'OT Hrs',
    'Federal',
    'FICA',
    'Medicare',
    'Total Tax',
    'Gross',
    '$/Hr',
    '$/OT',
  ]
  return (
    <div className='bg-white dark:bg-slate-900 rounded-xl border border-primary/10 overflow-hidden shadow-sm'>
      <div className='p-4 border-b border-primary/10 flex justify-between items-center'>
        <h3 className='font-bold text-lg px-2'>Income / Payroll History</h3>
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
              {COLS.map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${i > 0 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-primary/5'>
            {data.map(row => (
              <IncomeRow key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination total={INCOME.length} shown={data.length} />
    </div>
  )
}
