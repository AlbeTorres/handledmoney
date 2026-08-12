import type { CurrentBudgetComparison as CurrentBudgetComparisonData } from '@/interfaces'
import Link from 'next/link'

interface CurrentBudgetComparisonProps {
  comparison: CurrentBudgetComparisonData | null
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

export function CurrentBudgetComparison({ comparison }: CurrentBudgetComparisonProps) {
  if (!comparison) {
    return (
      <section aria-labelledby='current-budget-heading' className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6'>
        <h2 id='current-budget-heading' className='text-lg font-bold'>Current budget</h2>
        <p className='mt-2 text-sm text-slate-500 dark:text-slate-400'>Select a budget to compare your plan with actual transactions.</p>
        <Link href='/budget' className='inline-flex mt-4 text-sm font-bold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded'>
          Select current budget
        </Link>
      </section>
    )
  }

  return (
    <section aria-labelledby='current-budget-heading' className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden'>
      <div className='p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 justify-between items-start'>
        <div>
          <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>Current budget</p>
          <h2 id='current-budget-heading' className='text-lg font-bold'>{comparison.budget.name}</h2>
        </div>
        <Link href={`/budget/${comparison.budget.id}`} className='text-sm font-bold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded'>
          View budget
        </Link>
      </div>
      <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 border-b border-slate-200 dark:border-slate-800'>
        {([['Income', comparison.income], ['Outflow', comparison.outflow]] as const).map(([label, totals]) => (
          <div key={label} className='rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4'>
            <dt className='text-xs font-bold uppercase tracking-wider text-slate-500'>{label}</dt>
            <dd className='mt-2 grid grid-cols-3 gap-2 text-sm tabular-nums'>
              <span><span className='block text-xs text-slate-500'>Planned</span><strong>{formatCurrency(totals.plannedAmount)}</strong></span>
              <span><span className='block text-xs text-slate-500'>Actual</span><strong>{formatCurrency(totals.actualAmount)}</strong></span>
              <span className={totals.variance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}><span className='block text-xs text-slate-500'>Remaining</span><strong>{formatCurrency(totals.variance)}</strong></span>
            </dd>
          </div>
        ))}
      </dl>
      <div className='overflow-x-auto'>
        <table className='w-full text-left'>
          <caption className='sr-only'>Current budget planned and actual amounts by category</caption>
          <thead><tr className='bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider'><th scope='col' className='px-6 py-3'>Category</th><th scope='col' className='px-6 py-3 text-right'>Planned</th><th scope='col' className='px-6 py-3 text-right'>Actual</th><th scope='col' className='px-6 py-3 text-right'>Remaining</th></tr></thead>
          <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
            {[...comparison.categories, ...comparison.actualWithoutPlan].map(category => <tr key={category.categoryId}><th scope='row' className='px-6 py-3 text-sm font-medium'>{category.categoryName}{category.plannedAmount === 0 && <span className='ml-2 text-xs font-normal text-amber-700 dark:text-amber-400'>Unplanned</span>}</th><td className='px-6 py-3 text-right text-sm tabular-nums'>{formatCurrency(category.plannedAmount)}</td><td className='px-6 py-3 text-right text-sm tabular-nums'>{formatCurrency(category.actualAmount)}</td><td className={`px-6 py-3 text-right text-sm font-semibold tabular-nums ${category.variance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{formatCurrency(category.variance)}</td></tr>)}
            {comparison.categories.length === 0 && comparison.actualWithoutPlan.length === 0 && <tr><td colSpan={4} className='px-6 py-6 text-sm text-slate-500 text-center'>Add planned categories or categorized transactions to see a comparison.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}
