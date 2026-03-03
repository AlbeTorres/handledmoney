'use client'

import { fmt, fmtDate } from '@/lib/utils'
import { useTransactionState } from '@/store'
import { MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'

export default function IncomeRow({ tx }: { tx: any }) {
  const { onOpen } = useTransactionState()
  const amount = parseFloat(tx.amount || '0')
  const details = tx.incomeDetails || {}

  return (
    <tr className='hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group'>
      <td className='px-4 py-4 whitespace-nowrap'>
        <span className='text-sm font-bold text-slate-900 dark:text-white'>
          {fmtDate(new Date(tx.date))}
        </span>
      </td>
      <td className='px-4 py-4'>
        <div className='flex flex-col'>
          <span className='text-sm font-semibold'>{tx.payee}</span>
          <span className='text-[10px] text-slate-400 uppercase font-bold tracking-tight'>
            {details.incomeType?.replace('_', ' ')}
          </span>
        </div>
      </td>
      <td className='px-4 py-4 text-right'>
        <span className='text-sm font-bold text-emerald-500'>
          +${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className='px-4 py-4 text-right text-xs font-medium text-slate-600 dark:text-slate-400'>
        {details.hoursWorked ? fmt(details.hoursWorked) : '—'}
      </td>
      <td className='px-4 py-4 text-right text-xs font-medium text-slate-600 dark:text-slate-400'>
        {details.overtimeHours ? fmt(details.overtimeHours) : '—'}
      </td>
      <td className='px-4 py-4 text-right text-xs font-bold text-red-500'>
        {details.taxesWithheld ? `-$${fmt(details.taxesWithheld)}` : '—'}
      </td>
      <td className='px-4 py-4 text-right text-xs font-medium text-slate-700 dark:text-slate-300'>
        {details.grossAmount ? `$${fmt(details.grossAmount)}` : '—'}
      </td>
      <td className='px-4 py-4 text-right text-xs text-slate-500'>
        {details.wagePerHour ? `$${fmt(details.wagePerHour)}` : '—'}
      </td>
      <td className='px-4 py-4 text-right'>
        <Button variant='ghost' size='icon' className='size-8' onClick={() => onOpen(tx.id)}>
          <MoreHorizontal className='size-4' />
        </Button>
      </td>
    </tr>
  )
}
