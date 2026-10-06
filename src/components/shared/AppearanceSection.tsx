'use client'

import { useTranslations } from 'next-intl'
import { Field, FieldError } from '@/components/ui/field'
import { FieldErrors } from 'react-hook-form'
import { ColorPicker } from './ColorPicker'
import { IconPicker } from './IconPicker'

interface AppearanceSectionProps {
  iconValue: string
  colorValue: string
  onIconChange: (icon: string) => void
  onColorChange: (color: string) => void
  iconError?: FieldErrors[string]
  colorError?: FieldErrors[string]
}

export function AppearanceSection({
  iconValue,
  colorValue,
  onIconChange,
  onColorChange,
  iconError,
  colorError,
}: AppearanceSectionProps) {
  const t = useTranslations('handledmoney.account')
  return (
    <section className='space-y-6'>
      <h3 className='text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500'>
        {t('form.appearance')}
      </h3>

      <Field data-invalid={!!iconError}>
        <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
          {t('form.select_icon')}
        </label>
        <IconPicker value={iconValue} onChange={onIconChange} />
        {iconError && <FieldError errors={[iconError as { message?: string }]} />}
      </Field>

      <Field data-invalid={!!colorError}>
        <label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
          {t('form.account_color')}
        </label>
        <ColorPicker value={colorValue} onChange={onColorChange} />
        {colorError && <FieldError errors={[colorError as { message?: string }]} />}
      </Field>
    </section>
  )
}
