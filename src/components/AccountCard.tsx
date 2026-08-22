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
      className={`group bg-white dark:bg-slate-900 rounded-xl border-l-4 border-y border-r border-slate-200 dark:border-slate-800 p-6 transition-all relative`}
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
        <p className='text-[9px] font-semibold text-slate-400 uppercase tracking-widest'>
          {institution}
        </p>
        <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-4'>{name}</h3>
        <div className='flex text-xl gap-x-2'>
          <p className=' font-medium uppercase'>{detail}</p>
          <p>**** **** **** ****</p>
        </div>
      </div>
      <div className='mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 w-full'>
        <div className='flex items-baseline gap-1 tabular-nums'>
          <div className='flex items-center gap-2 justify-between w-full'>
            <div>
              <p className='text-2xl font-extrabold'>{balance}</p>
            </div>
            <p
              style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
              className='text-xs font-medium p-2 rounded-md text-slate-400'
            >
              {currency}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
