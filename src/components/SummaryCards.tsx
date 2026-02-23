import { fmt } from '@/lib/utils'

type Props = {
  activeView: string
  incomeData: any[]
}

export default function SummaryCards({ activeView, incomeData }: Props) {
  if (activeView === 'income') {
    const totalNet = incomeData.reduce((s, r) => s + r.total, 0)
    const totalGross = incomeData.reduce((s, r) => s + r.gross, 0)
    const totalTaxes = incomeData.reduce((s, r) => s + r.taxFederal + r.fica + r.medicare, 0)
    return (
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 flex items-center justify-between hover:border-primary transition-colors cursor-default'>
          <div className='flex flex-col gap-1'>
            <span className='text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider'>
              Total Net Pay
            </span>
            <span className='text-3xl font-bold text-slate-900 dark:text-white'>
              ${fmt(totalNet)}
            </span>
          </div>
          <div className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-full'>
            <span className='material-symbols-outlined'>savings</span>
          </div>
        </div>
        <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 flex items-center justify-between hover:border-primary transition-colors cursor-default'>
          <div className='flex flex-col gap-1'>
            <span className='text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider'>
              Total Gross
            </span>
            <span className='text-3xl font-bold text-slate-900 dark:text-white'>
              ${fmt(totalGross)}
            </span>
          </div>
          <div className='bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-full'>
            <span className='material-symbols-outlined'>payments</span>
          </div>
        </div>
        <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 flex items-center justify-between hover:border-primary transition-colors cursor-default'>
          <div className='flex flex-col gap-1'>
            <span className='text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider'>
              Total Taxes
            </span>
            <span className='text-3xl font-bold text-slate-900 dark:text-white'>
              ${fmt(totalTaxes)}
            </span>
          </div>
          <div className='bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-full'>
            <span className='material-symbols-outlined'>account_balance</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 flex items-center justify-between hover:border-primary transition-colors cursor-default'>
        <div className='flex flex-col gap-1'>
          <span className='text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider'>
            Current Balance
          </span>
          <span className='text-3xl font-bold text-slate-900 dark:text-white'>$14,250.42</span>
        </div>
        <div className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg flex items-center gap-1 font-bold text-sm'>
          <span className='material-symbols-outlined text-sm'>trending_up</span>
          2.4%
        </div>
      </div>
      <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 flex items-center justify-between hover:border-primary transition-colors cursor-default'>
        <div className='flex flex-col gap-1'>
          <span className='text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider'>
            Pending Transactions
          </span>
          <span className='text-3xl font-bold text-slate-900 dark:text-white'>
            3 <span className='text-slate-400 font-normal text-lg tracking-normal'>Hold</span>
          </span>
        </div>
        <div className='bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-3 rounded-full'>
          <span className='material-symbols-outlined'>schedule</span>
        </div>
      </div>
      <div className='flex items-center justify-end'>
        <button className='bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 w-full md:w-auto h-full'>
          <span className='material-symbols-outlined'>add_circle</span>
          Add New Transaction
        </button>
      </div>
    </div>
  )
}
