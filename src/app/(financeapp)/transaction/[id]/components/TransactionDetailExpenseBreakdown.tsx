import { formatMoney } from '@/lib/utils'
import { Check, Minus } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ExpenseDetailsSlice {
  salesTax: string | null
  taxRate: string | null
  isDeductible: boolean | null
  deductionCategory: string | null
}

interface TransactionDetailExpenseBreakdownProps {
  expenseDetails: ExpenseDetailsSlice | null
}

export function TransactionDetailExpenseBreakdown({
  expenseDetails,
}: TransactionDetailExpenseBreakdownProps) {
  const t = useTranslations('handledmoney.transaction.detail')

  if (!expenseDetails) return null

  const { salesTax, taxRate, isDeductible, deductionCategory } = expenseDetails

  return (
    <section className='rounded-sm border  bg-white p-5 shadow-sm dark:bg-slate-900'>
      <h2 className='mb-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
        {t('expense_breakdown')}
      </h2>

      <dl className='space-y-3'>
        {salesTax != null && (
          <div className='flex items-start justify-between gap-4'>
            <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>
              {t('sales_tax')}
            </dt>
            <dd className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
              {formatMoney(salesTax)}
            </dd>
          </div>
        )}
        {taxRate != null && (
          <div className='flex items-start justify-between gap-4'>
            <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>
              {t('tax_rate')}
            </dt>
            <dd className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
              {(Number(taxRate) * 100).toFixed(2)}%
            </dd>
          </div>
        )}
        {isDeductible != null && (
          <div className='flex items-start justify-between gap-4'>
            <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>
              {t('deductible')}
            </dt>
            <dd>
              {isDeductible ? (
                <span
                  data-testid='deductible-yes'
                  className='inline-flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                >
                  <Check className='size-4' />
                </span>
              ) : (
                <span
                  data-testid='deductible-no'
                  className='inline-flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                >
                  <Minus className='size-4' />
                </span>
              )}
            </dd>
          </div>
        )}
        {deductionCategory && (
          <div className='flex items-start justify-between gap-4'>
            <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>
              {t('deduction_category')}
            </dt>
            <dd className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
              {deductionCategory}
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}
