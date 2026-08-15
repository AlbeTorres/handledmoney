'use client'

import type { BudgetTemplateId } from '@/lib/budget-plan-templates'
import { Check, PieChart, Square } from 'lucide-react'
import { useTranslations } from 'next-intl'

type TemplateBudgetSelectProps = {
  value: BudgetTemplateId
  onValueChange: (value: BudgetTemplateId) => void
  disabled?: boolean
}

export default function TemplateBudgetSelect({
  value,
  onValueChange,
  disabled = false,
}: TemplateBudgetSelectProps) {
  const t = useTranslations('handledmoney.budget.form')
  const templates = [
    { id: 'starter' as const, icon: PieChart, title: t('template_starter'), description: t('template_starter_description') },
    { id: 'blank' as const, icon: Square, title: t('template_blank'), description: t('template_blank_description') },
  ]

  return (
    <fieldset disabled={disabled} className='space-y-3'>
      <legend className='label-caps text-muted-foreground'>{t('template_legend')}</legend>
      <div className='grid gap-4 md:grid-cols-2'>
        {templates.map(template => {
          const selected = value === template.id
          const Icon = template.icon
          return (
            <label
              key={template.id}
              className={`relative block rounded-lg border p-4 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${selected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <input
                type='radio'
                name='budget-template'
                value={template.id}
                checked={selected}
                onChange={() => onValueChange(template.id)}
                disabled={disabled}
                aria-label={template.title}
                className='sr-only'
              />
              <span
                aria-hidden='true'
                className={`absolute right-3 top-3 flex size-5 items-center justify-center rounded-full ${selected ? 'bg-primary text-primary-foreground' : 'border border-border'}`}
              >
                {selected && <Check className='size-3.5' strokeWidth={3} />}
              </span>
              <Icon aria-hidden='true' className='mb-3 size-6 text-muted-foreground' strokeWidth={1.5} />
              <span className='block body-lg font-medium'>{template.title}</span>
              <span className='block body-sm text-muted-foreground'>{template.description}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
