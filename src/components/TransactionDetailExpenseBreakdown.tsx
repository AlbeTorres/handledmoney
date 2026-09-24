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
  currency?: string
}

export function TransactionDetailExpenseBreakdown({
  expenseDetails,
  currency = 'USD',
}: TransactionDetailExpenseBreakdownProps) {
  const t = useTranslations('handledmoney.transaction.detail')

  if (!expenseDetails) return null

  const { salesTax, taxRate, isDeductible, deductionCategory } = expenseDetails

  return (
    <section className='rounded-sm border bg-white p-5 shadow-sm dark:bg-slate-900'>
      <h2 className='mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
        {t('expense_breakdown')}
      </h2>

      <dl className='space-y-3'>
        {salesTax != null && (
          <div className='flex items-start justify-between gap-4'>
            <dt className='text-sm font-medium text-muted-foreground'>{t('sales_tax')}</dt>
            <dd className='text-sm font-semibold text-foreground'>
              {formatMoney(salesTax, currency)}
            </dd>
          </div>
        )}
        {taxRate != null && (
          <div className='flex items-start justify-between gap-4'>
            <dt className='text-sm font-medium text-muted-foreground'>{t('tax_rate')}</dt>
            <dd className='text-sm font-semibold text-foreground'>
              {(Number(taxRate) * 100).toFixed(2)}%
            </dd>
          </div>
        )}
        {isDeductible != null && (
          <div className='flex items-start justify-between gap-4'>
            <dt className='text-sm font-medium text-muted-foreground'>{t('deductible')}</dt>
            <dd>
              {isDeductible ? (
                <span
                  data-testid='deductible-yes'
                  className='inline-flex size-6 items-center justify-center rounded-full bg-success/10 text-success'
                >
                  <Check className='size-4' />
                </span>
              ) : (
                <span
                  data-testid='deductible-no'
                  className='inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground'
                >
                  <Minus className='size-4' />
                </span>
              )}
            </dd>
          </div>
        )}
        {deductionCategory && (
          <div className='flex items-start justify-between gap-4'>
            <dt className='text-sm font-medium text-muted-foreground'>{t('deduction_category')}</dt>
            <dd className='text-sm font-semibold text-foreground'>{deductionCategory}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}
