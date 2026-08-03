import { useTranslations } from 'next-intl'
import { fmtDate } from '@/lib/utils'

interface TransactionDetailMetadataProps {
  id: string
  createdAt: Date
}

export function TransactionDetailMetadata({ id, createdAt }: TransactionDetailMetadataProps) {
  const t = useTranslations('handledmoney.transaction.detail')

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
      <dl className='space-y-3'>
        <div className='flex items-start justify-between gap-4'>
          <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>
            {t('transaction_id')}
          </dt>
          <dd className='font-mono text-sm text-slate-900 dark:text-slate-100'>{id}</dd>
        </div>
        <div className='flex items-start justify-between gap-4'>
          <dt className='text-sm font-medium text-slate-500 dark:text-slate-400'>
            {t('added_on')}
          </dt>
          <dd className='text-sm text-slate-900 dark:text-slate-100'>{fmtDate(createdAt)}</dd>
        </div>
      </dl>
    </section>
  )
}
