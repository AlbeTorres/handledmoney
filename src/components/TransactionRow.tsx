import { ReactNode } from 'react'

interface TransactionRowProps {
  icon: ReactNode
  entity: string
  account: string
  date: string
  amount: string
  isExpense?: boolean
  status: string
  statusVariant: 'completed' | 'pending'
}

export function TransactionRow({
  icon,
  entity,
  account,
  date,
  amount,
  isExpense = true,
  status,
  statusVariant,
}: TransactionRowProps) {
  const statusColors =
    statusVariant === 'completed'
      ? 'bg-emerald-500/10 text-emerald-500'
      : 'bg-amber-500/10 text-amber-500'

  const amountColor = isExpense ? 'text-rose-500' : 'text-emerald-500'

  return (
    <tr className='hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors'>
      <td className='px-6 py-4'>
        <div className='flex items-center gap-3'>
          <div className='size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center'>
            {icon}
          </div>
          <span className='text-sm font-bold'>{entity}</span>
        </div>
      </td>
      <td className='px-6 py-4 text-sm text-slate-500 dark:text-slate-400'>{account}</td>
      <td className='px-6 py-4 text-sm text-slate-500 dark:text-slate-400'>{date}</td>
      <td className={`px-6 py-4 text-right text-sm font-bold ${amountColor} tabular-nums`}>
        {amount}
      </td>
      <td className='px-6 py-4'>
        <div className='flex justify-center'>
          <span
            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors}`}
          >
            {status}
          </span>
        </div>
      </td>
    </tr>
  )
}
