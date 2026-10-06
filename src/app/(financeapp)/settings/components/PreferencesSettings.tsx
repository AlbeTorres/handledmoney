'use client'

import { changeLocale } from '@/actions/locale/change-locale'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { LucideInfo, LucideSettings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'

type FormValues = {
  locale: string
}

export default function PreferencesSettings() {
  const t = useTranslations('handledmoney.settings.preferences')
  const router = useRouter()

  const form = useForm<FormValues>({
    defaultValues: {
      locale: 'en',
    },
  })

  const handleLocaleChange = async (value: string) => {
    await changeLocale(value)
    router.refresh()
  }

  return (
    <div className='bg-white shadow-sm p-6 rounded-xl flex flex-col gap-5 md:col-span-2'>
      <div className='flex items-center gap-2 mb-base'>
        <LucideSettings size={20} />
        <h3 className='font-bold text-foreground'>{t('heading')}</h3>
      </div>
      <form>
        <FieldGroup>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            <Controller
              name='locale'
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className='font-label-caps text-on-surface-variant'>
                    {t('language_label')}
                  </FieldLabel>
                  <select
                    {...field}
                    className='w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-lg bg-surface appearance-none cursor-pointer input-focus-ring'
                    onChange={e => {
                      field.onChange(e)
                      handleLocaleChange(e.target.value)
                    }}
                  >
                    <option value='en'>English (US)</option>
                    <option value='es'>Español (ES)</option>
                  </select>
                </Field>
              )}
            />
            <div className='flex flex-col gap-1'>
              <label className='font-label-caps text-on-surface-variant'>{t('timezone_label')}</label>
              <select className='w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-lg bg-surface appearance-none cursor-pointer input-focus-ring'>
                <option>(GMT-08:00) Pacific Time</option>
                <option>(GMT-05:00) Eastern Time</option>
                <option>(GMT+00:00) UTC</option>
                <option>(GMT+01:00) Central European Time</option>
              </select>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='font-label-caps text-on-surface-variant'>{t('currency_label')}</label>
              <select className='w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-lg bg-surface appearance-none cursor-pointer input-focus-ring'>
                <option>$1,234.56 (USD)</option>
                <option>1.234,56 € (EUR)</option>
                <option>£1,234.56 (GBP)</option>
                <option>¥123,456 (JPY)</option>
              </select>
            </div>
          </div>
        </FieldGroup>
      </form>
      <div className='mt-2 p-2 bg-secondary/5 rounded-lg border border-secondary/20 flex items-start gap-3'>
        <LucideInfo size={20} className='text-secondary mt-1' />
        <p className='text-primary font-semibold'>
          {t('info_text')}
        </p>
      </div>
    </div>
  )
}
