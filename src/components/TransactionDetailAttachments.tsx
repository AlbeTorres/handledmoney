import { FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TransactionDetailAttachmentsProps {
  /** Real attachment entries. Omitted or empty renders the unavailable state. */
  files?: readonly { name: string; size: string }[]
}

/**
 * Attachment list. There is no attachments table in the schema yet, so the
 * component intentionally renders an explicit empty/unavailable state instead
 * of fabricated files or download affordances.
 */
export function TransactionDetailAttachments({ files = [] }: TransactionDetailAttachmentsProps) {
  const t = useTranslations('handledmoney.transaction.detail')

  return (
    <section className='rounded-sm border bg-white p-5 shadow-sm dark:bg-slate-900'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
          {t('attachments')}
        </h2>
        <span
          data-testid='attachments-count'
          className='inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground'
        >
          {files.length}
        </span>
      </div>

      {files.length === 0 ? (
        <p
          data-testid='attachments-empty'
          className='flex items-center gap-2 text-sm text-muted-foreground'
        >
          <FileText className='size-4 shrink-0' aria-hidden='true' />
          {t('attachments_empty')}
        </p>
      ) : (
        <ul className='space-y-2'>
          {files.map(file => (
            <li
              key={file.name}
              className='flex items-center justify-between gap-3 rounded-lg border px-3 py-2 bg-muted/50'
            >
              <div className='flex min-w-0 items-center gap-2'>
                <FileText className='size-4 shrink-0 text-muted-foreground' aria-hidden='true' />
                <span className='truncate text-sm font-medium text-foreground'>{file.name}</span>
              </div>
              <span className='shrink-0 text-xs text-muted-foreground'>{file.size}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
