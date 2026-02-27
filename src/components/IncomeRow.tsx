import { fmt, fmtDate } from '@/lib/utils'

type Income = {
  id: number
  date: string
  category: string
  total: number
  hours: number
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
  row: Income
}

export default function IncomeRow({ row }: Props) {
  return (
    <tr className='hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer'>
      <td className='px-4 py-4 whitespace-nowrap'>
        <span className='text-sm font-bold text-slate-900 dark:text-white'>
          {fmtDate(row.date)}
        </span>
      </td>
      <td className='px-4 py-4 text-sm text-right font-bold text-emerald-600 dark:text-emerald-400'>
        {row.category}
      </td>
      <td className='px-4 py-4 text-sm text-right font-bold text-emerald-600 dark:text-emerald-400'>
        ${fmt(row.total)}
      </td>
      <td className='px-4 py-4 text-sm text-right text-slate-700 dark:text-slate-300'>
        {fmt(row.hours)}
      </td>
      <td className='px-4 py-4 text-sm text-right text-slate-600 dark:text-slate-400'>
        {fmt(row.overtime)}
      </td>
      <td className='px-4 py-4 text-sm text-right text-red-500'>${fmt(row.taxFederal)}</td>
      <td className='px-4 py-4 text-sm text-right text-red-400'>${fmt(row.fica)}</td>
      <td className='px-4 py-4 text-sm text-right text-red-400'>${fmt(row.medicare)}</td>

      <td className='px-4 py-4 text-sm text-right text-slate-700 dark:text-slate-300'>
        ${fmt(row.gross)}
      </td>
      <td className='px-4 py-4 text-sm text-right text-slate-500'>${fmt(row.rateHour)}</td>
      <td className='px-4 py-4 text-sm text-right text-slate-500'>
        {row.rateOTpay > 0 ? (
          <span className='text-amber-600 dark:text-amber-400 font-semibold'>
            ${fmt(row.rateOTpay)}
          </span>
        ) : (
          <span className='text-slate-300 dark:text-slate-600'>—</span>
        )}
      </td>
    </tr>
  )
}
