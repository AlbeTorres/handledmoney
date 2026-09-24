'use client'

import { LucideTriangleAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from './ui/button'

export default function DangerZoneSettings() {
  const t = useTranslations('handledmoney.settings.danger_zone')

  return (
    <section className='mt-4 flex flex-col items-start justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/10 p-6 md:flex-row md:items-center'>
      <div>
        <h2 className='flex items-center gap-2 text-lg font-semibold text-destructive'>
          <LucideTriangleAlert size={20} />
          {t('heading')}
        </h2>
        <p className='mt-1 text-sm text-muted-foreground'>{t('description')}</p>
      </div>
      <Button variant='destructive' disabled title={t('unavailable')}>
        {t('delete_button')}
      </Button>
      <p className='text-sm text-muted-foreground md:text-right'>{t('unavailable')}</p>
    </section>
  )
}
