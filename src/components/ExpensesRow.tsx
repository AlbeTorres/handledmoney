'use client'

import { fmtDate } from '@/lib/utils'
import { useTransactionState } from '@/store'
import { FileIcon, MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'

export default function ExpenseRow({ tx }: { tx: any }) {
  const { onOpen } = useTransactionState()
  const amount = parseFloat(tx.amount || '0')
  const salesTax = parseFloat(tx.expenseDetails?.salesTax || '0')

  return (
    <tr className='hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group'>
      <td className='px-6 py-4'>
        <span className='text-sm font-bold text-slate-900 dark:text-white'>
          {fmtDate(new Date(tx.date))}
        </span>
      </td>
      <td className='px-6 py-4'>
        <div className='flex flex-col'>
          <span className='text-sm font-semibold'>{tx.payee}</span>
          {tx.account && (
            <span className='text-[10px] text-slate-400 uppercase font-bold tracking-tight'>
              {tx.account.name}
            </span>
          )}
        </div>
      </td>
      <td className='px-6 py-4'>
        {tx.category ? (
          <span
            className='px-3 py-1 text-[10px] font-bold rounded-full border border-primary/10 bg-primary/5 text-primary'
            style={{
              borderColor: `${tx.category.color}40`,
              backgroundColor: `${tx.category.color}15`,
              color: tx.category.color,
            }}
          >
            {tx.category.name}
          </span>
        ) : (
          <span className='text-[10px] font-bold text-slate-400'>No Category</span>
        )}
      </td>
      <td className='px-6 py-4'>
        <span className='text-sm font-bold text-red-500'>
          -${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className='px-6 py-4 text-center'>
        <span className='text-xs font-medium text-slate-500'>
          ${salesTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className='px-6 py-4 text-center'>
        {tx.expenseDetails?.receiptUrl ? (
          <FileIcon className='size-4 mx-auto text-primary opacity-60 hover:opacity-100 transition-opacity cursor-pointer' />
        ) : (
          <span className='text-slate-300 dark:text-slate-700'>—</span>
        )}
      </td>
      <td className='px-6 py-4 text-right'>
        <Button variant='ghost' size='icon' className='size-8' onClick={() => onOpen(tx.id)}>
          <MoreHorizontal className='size-4' />
        </Button>
      </td>
    </tr>
  )
}
