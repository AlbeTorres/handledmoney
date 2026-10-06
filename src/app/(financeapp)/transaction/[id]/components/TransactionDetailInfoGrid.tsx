import { useTranslations } from 'next-intl'
import { TransactionCategoryCell } from './TransactionCategoryCell'

// PLACEHOLDER: no tags table exists yet — replace with real tag data when the schema lands
const PLACEHOLDER_TAGS = ['Work', 'Q4'] as const

interface TransactionDetailInfoGridProps {
  payee: string
  category: { id: string; name: string; icon: string | null } | null
  notes: string | null
}

export function TransactionDetailInfoGrid({
  payee,
  category,
  notes,
}: TransactionDetailInfoGridProps) {
  const t = useTranslations('handledmoney.transaction.detail')

  return (
    <section className='rounded-sm border bg-white p-5 shadow-sm  dark:bg-slate-900'>
      <dl className='divide-y divide-slate-100 dark:divide-slate-800'>
        <div className='flex items-start justify-between gap-4 py-3'>
          <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>{t('payee')}</dt>
          <dd className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{payee}</dd>
        </div>
        <div className='flex items-start justify-between gap-4 py-3'>
          <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>
            {t('category')}
          </dt>
          <dd>
            {category ? (
              <TransactionCategoryCell
                categoryName={category.name}
                icon={category.icon ?? undefined}
              />
            ) : (
              <TransactionCategoryCell categoryName={undefined} />
            )}
          </dd>
        </div>
        <div
          data-testid='tags-placeholder'
          data-placeholder='true'
          className='flex items-start justify-between gap-4 py-3'
        >
          <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>{t('tags')}</dt>
          <dd className='text-sm text-slate-900 dark:text-slate-100'>
            {PLACEHOLDER_TAGS.join(', ')}
          </dd>
        </div>
        <div className='flex items-start justify-between gap-4 py-3'>
          <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>{t('notes')}</dt>
          <dd className='min-w-0 flex-1'>
            <p className='wrap-break-word whitespace-pre-wrap text-left text-sm text-slate-900 dark:text-slate-100'>
              {notes ?? '—'}
            </p>
          </dd>
        </div>
      </dl>
    </section>
  )
}
