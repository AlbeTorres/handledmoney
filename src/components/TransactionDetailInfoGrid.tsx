import { useTranslations } from 'next-intl'
import { TransactionCategoryCell } from './TransactionCategoryCell'

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
    <section className='rounded-sm border bg-white p-5 shadow-sm dark:bg-slate-900'>
      <dl className='divide-y divide-border'>
        <div className='flex items-start justify-between gap-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>{t('payee')}</dt>
          <dd className='text-sm font-semibold text-foreground'>{payee}</dd>
        </div>
        <div className='flex items-start justify-between gap-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>{t('category')}</dt>
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
        <div className='flex items-start justify-between gap-4 py-3'>
          <dt className='text-sm font-medium text-muted-foreground'>{t('notes')}</dt>
          <dd className='min-w-0 flex-1'>
            <p className='wrap-break-word whitespace-pre-wrap text-left text-sm text-foreground'>
              {notes ?? '—'}
            </p>
          </dd>
        </div>
      </dl>
    </section>
  )
}
