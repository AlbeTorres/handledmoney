import { getTranslations } from 'next-intl/server'
import { LucideMail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldDescription } from '@/components/ui/field'

export default async function NotificationChannelSettings() {
  const t = await getTranslations('handledmoney.settings.notifications')

  return (
    <Card className='lg:col-span-2'>
      <CardHeader className='flex-row items-center gap-2'>
        <LucideMail size={20} />
        <CardTitle>{t('heading')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='divide-y'>
          <div className='flex items-center justify-between gap-4 py-4'>
            <div>
              <p className='font-medium'>{t('balance_alerts_title')}</p>
              <FieldDescription>{t('balance_alerts_description')}</FieldDescription>
            </div>
            <span className='text-sm text-muted-foreground'>{t('unavailable')}</span>
          </div>
          <div className='flex items-center justify-between gap-4 py-4'>
            <div>
              <p className='font-medium'>{t('weekly_summaries_title')}</p>
              <FieldDescription>{t('weekly_summaries_description')}</FieldDescription>
            </div>
            <span className='text-sm text-muted-foreground'>{t('unavailable')}</span>
          </div>
          <div className='flex items-center justify-between gap-4 py-4'>
            <div>
              <p className='font-medium'>{t('marketing_title')}</p>
              <FieldDescription>{t('marketing_description')}</FieldDescription>
            </div>
            <span className='text-sm text-muted-foreground'>{t('unavailable')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
