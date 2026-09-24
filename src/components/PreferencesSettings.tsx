'use client'

import { changeLocale } from '@/actions/locale/change-locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LucideInfo, LucideSettings } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'

type FormValues = {
  locale: string
}

export default function PreferencesSettings() {
  const t = useTranslations('handledmoney.settings.preferences')
  const locale = useLocale()
  const router = useRouter()

  const form = useForm<FormValues>({
    defaultValues: {
      locale,
    },
  })

  const handleLocaleChange = async (value: string) => {
    await changeLocale(value)
    router.refresh()
  }

  return (
    <Card className='lg:col-span-2'>
      <CardHeader className='flex-row items-center gap-2'>
        <LucideSettings size={20} />
        <CardTitle>{t('heading')}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <form>
          <FieldGroup>
            <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
              <Controller
                name='locale'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t('language_label')}</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value)
                        void handleLocaleChange(value)
                      }}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='en'>English (US)</SelectItem>
                        <SelectItem value='es'>Español (ES)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Field data-disabled>
                <FieldLabel>{t('timezone_label')}</FieldLabel>
                <Select disabled value='unavailable'>
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='unavailable'>{t('unavailable_value')}</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>{t('unavailable_help')}</FieldDescription>
              </Field>
              <Field data-disabled>
                <FieldLabel>{t('currency_label')}</FieldLabel>
                <Select disabled value='unavailable'>
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='unavailable'>{t('unavailable_value')}</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>{t('unavailable_help')}</FieldDescription>
              </Field>
            </div>
          </FieldGroup>
        </form>
        <div className='flex items-start gap-3 rounded-md border bg-muted/50 p-3'>
          <LucideInfo size={20} className='mt-0.5 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>{t('info_text')}</p>
        </div>
      </CardContent>
    </Card>
  )
}
