import { useTranslations } from 'next-intl'
import { formatMoney } from '@/lib/utils'

// Human-friendly labels for the schema enum values. No i18n keys exist for these
// domain codes yet, so the labels are defined here as typed constants.
const INCOME_TYPE_LABELS: Record<string, string> = {
  product_sale: 'Product Sale',
  service_w2: 'W2',
  service_1099: '1099',
  service_llc: 'LLC',
  investment: 'Investment',
  other: 'Other',
}

const BILLING_TYPE_LABELS: Record<string, string> = {
  hourly: 'Hourly',
  project: 'Project',
  salary: 'Salary',
}

// Render only the tax breakdown keys the UI knows about; unknown jsonb keys are ignored
const TAX_DETAIL_KEYS = ['federal', 'state', 'fica', 'medicare'] as const

const labelFor = (labels: Record<string, string>, value: string | null) =>
  value ? (labels[value] ?? value) : null

interface IncomeDetailsSlice {
  incomeType: string | null
  billingType: string | null
  grossAmount: string | null
  taxesWithheld: string | null
  taxBreakdown: Record<string, number | string> | null
}

interface TransactionDetailIncomeBreakdownProps {
  incomeDetails: IncomeDetailsSlice | null
}

export function TransactionDetailIncomeBreakdown({
  incomeDetails,
}: TransactionDetailIncomeBreakdownProps) {
  const t = useTranslations('handledmoney.transaction.detail')
  const tTx = useTranslations('handledmoney.transaction')

  if (!incomeDetails) return null

  const { incomeType, billingType, grossAmount, taxesWithheld, taxBreakdown } = incomeDetails
  const gross = Number(grossAmount ?? '0')
  const withheld = Number(taxesWithheld ?? '0')
  const net = gross - withheld
  const expensePrefix = tTx('amount.expense_prefix')

  const incomeLabel = labelFor(INCOME_TYPE_LABELS, incomeType)
  const billingLabel = labelFor(BILLING_TYPE_LABELS, billingType)

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
      <h2 className='mb-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
        {t('income_breakdown')}
      </h2>

      {(incomeLabel || billingLabel) && (
        <div className='mb-4 flex flex-wrap gap-2'>
          {incomeLabel && (
            <span className='inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'>
              {incomeLabel}
            </span>
          )}
          {billingLabel && (
            <span className='inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-400'>
              {billingLabel}
            </span>
          )}
        </div>
      )}

      <dl className='space-y-3'>
        <div className='flex items-start justify-between gap-4'>
          <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>
            {t('gross_amount')}
          </dt>
          <dd className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
            {formatMoney(gross)}
          </dd>
        </div>
        <div className='flex items-start justify-between gap-4'>
          <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>
            {t('taxes_withheld')}
          </dt>
          <dd className='text-sm font-semibold text-rose-600 dark:text-rose-400'>
            {expensePrefix}
            {formatMoney(withheld)}
          </dd>
        </div>
        <div className='flex items-start justify-between gap-4'>
          <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>
            {t('net_amount')}
          </dt>
          <dd className='text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
            {formatMoney(net)}
          </dd>
        </div>
      </dl>

      {taxBreakdown && (
        <div className='mt-4 border-t border-slate-100 pt-4 dark:border-slate-800'>
          <h3 className='mb-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
            {t('tax_details')}
          </h3>
          <dl className='space-y-2'>
            {TAX_DETAIL_KEYS.map(key => {
              if (!(key in taxBreakdown)) return null
              return (
                <div key={key} className='flex items-start justify-between gap-4'>
                  <dt className='text-sm text-slate-500 dark:text-slate-400'>
                    {t(`tax_${key}`)}
                  </dt>
                  <dd className='text-sm text-slate-900 dark:text-slate-100'>
                    {formatMoney(Number(taxBreakdown[key]))}
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      )}
    </section>
  )
}
