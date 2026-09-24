'use client'

import { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

type CategoryPreviewProps = {
  name: string
  color: string
  type: string
  Icon: LucideIcon
}

export const CategoryPreview = ({ name, color, type, Icon }: CategoryPreviewProps) => {
  const t = useTranslations('handledmoney.category')

  // color is a hex value without the leading '#' (stored like CategoryCard expects).
  const hex = color ? `#${color}` : '#94a3b8'

  return (
    <div className='pt-8 border-t border-border'>
      <div className='max-w-sm mx-auto p-2'>
        <label className='block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 text-center'>
          {t('preview.live_preview')}
        </label>
        <div
          className='flex items-center p-5 rounded-sm border bg-white shadow-sm transition-colors dark:bg-slate-900'
          style={{
            backgroundColor: hex + '08',
            borderColor: hex + '30',
          }}
        >
          <div
            className='size-14 rounded-sm flex items-center justify-center text-white mr-5 shadow-sm'
            style={{
              backgroundColor: hex,
            }}
          >
            <Icon />
          </div>
          <div>
            <h4 className='font-bold text-base text-foreground'>
              {name || t('preview.category_name')}
            </h4>
            <p className='text-xs font-semibold' style={{ color: hex }}>
              {type ? type.charAt(0).toUpperCase() + type.slice(1) : t('preview.type')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
