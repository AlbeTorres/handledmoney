import { getTranslations } from 'next-intl/server'
import { LucideMail } from 'lucide-react'

export default async function NotificationChannelSettings() {
  const t = await getTranslations('handledmoney.settings.notifications')

  return (
    <div className='bg-white shadow-sm p-5 rounded-xl flex flex-col gap-2 md:col-span-2'>
      <div className='flex justify-between items-center mb-base'>
        <div className='flex items-center gap-2'>
          <LucideMail size={20} />
          <h3 className='font-bold text-foreground'>{t('heading')}</h3>
        </div>
      </div>
      <div className='divide-y divide-outline-variant'>
        <div className='py-4 flex justify-between items-center'>
          <div>
            <p className='font-body-lg text-body-lg font-bold text-primary'>{t('balance_alerts_title')}</p>
            <p className='font-body-sm text-body-sm text-on-surface-variant'>
              {t('balance_alerts_description')}
            </p>
          </div>
          <div className='relative inline-flex items-center cursor-pointer'>
            <input className='sr-only peer' type='checkbox' />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
          </div>
        </div>
        <div className='py-4 flex justify-between items-center'>
          <div>
            <p className='font-body-lg text-body-lg font-bold text-primary'>{t('weekly_summaries_title')}</p>
            <p className='font-body-sm text-body-sm text-on-surface-variant'>
              {t('weekly_summaries_description')}
            </p>
          </div>
          <div className='relative inline-flex items-center cursor-pointer'>
            <input className='sr-only peer' type='checkbox' defaultChecked />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
          </div>
        </div>
        <div className='py-4 flex justify-between items-center'>
          <div>
            <p className='font-body-lg text-body-lg font-bold text-primary'>
              {t('marketing_title')}
            </p>
            <p className='font-body-sm text-body-sm text-on-surface-variant'>
              {t('marketing_description')}
            </p>
          </div>
          <div className='relative inline-flex items-center cursor-pointer'>
            <input className='sr-only peer' type='checkbox' />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
