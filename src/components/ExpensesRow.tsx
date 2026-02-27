import { CATEGORY_COLORS } from '@/lib/data'
import { fmtDate } from '@/lib/utils'

export default function ExpenseRow({ tx }) {
  return (
    <tr
      className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group ${tx.pending ? 'bg-primary/5 hover:bg-primary/10 opacity-80 italic' : ''}`}
    >
      <td className='px-6 py-5'>
        <div className='flex flex-col'>
          <span className='text-sm font-bold text-slate-900 dark:text-white'>
            {fmtDate(tx.date)}
          </span>
        </div>
      </td>
      <td className='px-6 py-5'>
        <div className='flex items-center gap-3'>
          <span className='text-sm font-semibold'>{tx.payee}</span>
        </div>
      </td>
      <td className='px-6 py-5'>
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full border ${CATEGORY_COLORS[tx.categoryColor]?.badge}`}
        >
          {tx.category}
        </span>
      </td>
      <td className='px-6 py-5'>
        <span
          className={`text-sm font-bold ${tx.pending ? 'text-slate-600 dark:text-slate-400' : tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}
        >
          {tx.amount > 0 ? '+' : ''}
          {tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </span>
      </td>
      <td className='px-6 py-5 text-center'>
        {tx.pending ? (
          <span className='material-symbols-outlined text-slate-300'>hourglass_top</span>
        ) : tx.receipt ? (
          <span className='material-symbols-outlined text-slate-400 hover:text-primary transition-colors'>
            attachment
          </span>
        ) : (
          <span className='text-slate-300 dark:text-slate-700'>—</span>
        )}
      </td>
    </tr>
  )
}
