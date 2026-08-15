'use client'

import { useTranslations } from 'next-intl'

export type WizardStep = 'setup' | 'structure' | 'allocation'

const steps: ReadonlyArray<{ id: WizardStep; labelKey: string }> = [
  { id: 'setup', labelKey: 'step_setup' },
  { id: 'structure', labelKey: 'step_structure' },
  { id: 'allocation', labelKey: 'step_allocation' },
]

export function BudgetCreationStepper({ currentStep }: { currentStep: WizardStep }) {
  const t = useTranslations('handledmoney.budget.form')
  const currentIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <nav aria-label={t('steps_label')}>
      <ol className='grid grid-cols-3 gap-3'>
        {steps.map((step, index) => {
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          return (
            <li key={step.id} aria-current={isActive ? 'step' : undefined}>
              <div className={isActive || isCompleted ? 'h-1.5 rounded bg-primary' : 'h-1.5 rounded bg-muted'} />
              <span
                className={
                  isActive
                    ? 'text-sm font-semibold text-primary'
                    : isCompleted
                      ? 'text-sm text-foreground'
                      : 'text-sm text-muted-foreground'
                }
              >
                {t(step.labelKey)}
              </span>
            </li>
          )
        })}
      </ol>
      <p className='text-xs text-muted-foreground'>
        {t('step_count', { current: currentIndex + 1, total: steps.length })}
      </p>
    </nav>
  )
}
