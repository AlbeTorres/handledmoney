'use client'

import IncomeRow from './IncomeRow'
import Pagination from './Pagination'

type Props = {
  data: any[]
  total: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function IncomeTable({ data, total, page, totalPages, onPageChange }: Props) {
  return (
    <div className='bg-white dark:bg-slate-900 rounded-xl border border-primary/10 overflow-hidden shadow-sm'>
      <div className='p-4 border-b border-primary/10 flex justify-between items-center'>
        <h3 className='font-bold text-lg px-2'>Income History</h3>
        <div className='flex gap-2 text-xs font-bold text-slate-500'>
          Total income:{' '}
          <span className='text-emerald-500'>
            $
            {data
              .reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead className='bg-slate-50 dark:bg-slate-800/50'>
            <tr>
              {[
                { label: 'Date', align: 'left' },
                { label: 'Payee / Type', align: 'left' },
                { label: 'Net Total', align: 'right' },
                { label: 'Hours', align: 'right' },
                { label: 'OT', align: 'right' },
                { label: 'Taxes', align: 'right' },
                { label: 'Gross', align: 'right' },
                { label: 'Rate/hr', align: 'right' },
                { label: '', align: 'right' },
              ].map(h => (
                <th
                  key={h.label}
                  className={`px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-${h.align}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-primary/5'>
            {data.length > 0 ? (
              data.map(tx => <IncomeRow key={tx.id} tx={tx} />)
            ) : (
              <tr>
                <td colSpan={9} className='px-6 py-20 text-center text-slate-400 font-medium'>
                  No income records found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        shown={data.length}
        onPageChange={onPageChange}
      />
    </div>
  )
}
