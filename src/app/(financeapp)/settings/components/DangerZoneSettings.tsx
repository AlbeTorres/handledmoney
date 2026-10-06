'use client'

import { LucideTriangleAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function DangerZoneSettings() {
  const t = useTranslations('handledmoney.settings.danger_zone')

  return (
    <div className='mt-10 p-6 border border-destructive/30 bg-destructive/10 rounded-xl flex flex-col md:flex-row justify-between items-center gap-md'>
      <div>
        <h4 className=' text-2xl text-destructive flex items-center gap-2'>
          <LucideTriangleAlert size={20} />
          {t('heading')}
        </h4>
        <p className='font-body-sm text-body-sm text-on-error-container'>
          {t('description')}
        </p>
      </div>
      <button className='px-6 py-2 border border-destructive text-destructive rounded-lg font-label-caps hover:bg-destructive hover:text-white transition-all'>
        {t('delete_button')}
      </button>
    </div>
  )
}
