import { Download, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AttachmentPlaceholder {
  name: string
  size: string
}

// PLACEHOLDER: no attachments table exists yet — replace with real attachment
// data when the schema lands. Keep this array as the single swap point.
const PLACEHOLDER_ATTACHMENTS: readonly AttachmentPlaceholder[] = [
  { name: 'Paystub_Oct24.pdf', size: '142 KB' },
  { name: 'Bonus_Letter.png', size: '1.2 MB' },
]

interface TransactionDetailAttachmentsProps {
  files?: readonly AttachmentPlaceholder[]
}

export function TransactionDetailAttachments({
  files = PLACEHOLDER_ATTACHMENTS,
}: TransactionDetailAttachmentsProps) {
  const t = useTranslations('handledmoney.transaction.detail')

  return (
    <section className='rounded-xl border border-border bg-card p-5'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='label-caps text-muted-foreground'>{t('attachments')}</h2>
        <span
          data-testid='attachments-count'
          className='inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground'
        >
          {files.length}
        </span>
      </div>

      <p className='mb-4 text-xs text-muted-foreground'>{t('attachments_placeholder_note')}</p>

      {files.length === 0 ? (
        <p data-testid='attachments-empty' className='text-sm text-muted-foreground'>
          —
        </p>
      ) : (
        <ul className='space-y-2'>
          {files.map(file => (
            <li
              key={file.name}
              className='flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2'
            >
              <div className='flex min-w-0 items-center gap-2'>
                <FileText className='size-4 shrink-0 text-muted-foreground' aria-hidden='true' />
                <span className='truncate text-sm font-medium text-foreground'>{file.name}</span>
              </div>
              <div className='flex shrink-0 items-center gap-3'>
                <span className='text-xs text-muted-foreground'>{file.size}</span>
                <Download
                  data-testid='attachment-download'
                  className='size-4 text-muted-foreground'
                  aria-hidden='true'
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}