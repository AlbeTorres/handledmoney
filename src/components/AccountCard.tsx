'use client'

import { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { DropDownActionMenu } from './DropDownActionMenu'

export interface AccountCardProps {
  institution: string
  name: string
  balance: string
  decimal?: string
  currency: string
  detail: string
  status: string
  statusVariant: 'active' | 'live' | 'due'
  accentColor: string
  Icon: LucideIcon
  onEdit?: () => void
  onDelete?: () => void
  onDetails?: () => void
}

export function AccountCard({
  institution,
  name,
  balance,
  currency,
  detail,
  accentColor,
  Icon,
  onEdit,
  onDelete,
  onDetails,
}: AccountCardProps) {
  const t = useTranslations('handledmoney.account')

  return (
    <div
      className={`group relative rounded-xl border-y border-r border-l-4 border-border bg-card p-6 transition-all`}
      style={{ borderLeftColor: accentColor }}
    >
      <div className='flex justify-between items-start mb-6'>
        <div
          className='size-12 rounded-xl flex items-center justify-center'
          style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
        >
          <Icon className='size-7' />
        </div>

        <DropDownActionMenu
          ariaLabel={t('card.options_aria')}
          actions={[
            {
              label: t('card.details'),
              onClick: () => onDetails?.(),
            },
            {
              label: t('card.edit_account'),
              onClick: () => onEdit?.(),
            },
            {
              label: t('card.delete_account'),
              onClick: () => onDelete?.(),
              variant: 'destructive',
            },
          ]}
        />
      </div>
      <div>
        <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
          {institution}
        </p>
        <h3 className='mb-4 text-xl font-bold text-foreground'>{name}</h3>
        <p className='text-sm font-medium uppercase tracking-wide text-muted-foreground'>
          {detail}
        </p>
      </div>
      <div className='mt-6 w-full border-t border-border pt-4'>
        <div className='flex items-baseline gap-1 tabular-nums'>
          <div className='flex w-full items-center justify-between gap-2'>
            <div>
              <p className='text-2xl font-extrabold'>{balance}</p>
            </div>
            <p
              style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
              className='rounded-md p-2 text-xs font-medium'
            >
              {currency}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
