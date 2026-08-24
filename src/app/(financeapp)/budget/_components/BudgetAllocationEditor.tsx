'use client'

import { BudgetAllocationSummary } from '@/app/(financeapp)/budget/_components/BudgetAllocationSummary'
import type { BudgetCategory } from './CategoryCombobox'
import { FieldError } from '@/components/ui/field'

import {

  getBudgetAllocationTotals,

} from '@/lib/budget-allocation'
import type { CreateBudgetValues } from '@/lib/schema'

import { useTranslations } from 'next-intl'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { StepFooter } from './createsteps/step-footer'
import { WizardStep } from './BudgetCreationStepper'
import { GroupCard } from './group-card'



interface BudgetAllocationEditorProps {
  form: UseFormReturn<CreateBudgetValues>
  categories: BudgetCategory[]
  setStep: (step: WizardStep) => void
  allocationHeadingRef: React.RefObject<HTMLHeadingElement | null>
  isPending: boolean
}

export function BudgetAllocationEditor({ form, categories, setStep,allocationHeadingRef, isPending }: BudgetAllocationEditorProps) {

    const t = useTranslations('handledmoney.budget.form')
  const groups = form.watch('groups') ?? []
  const totals = getBudgetAllocationTotals(groups)
  // Resolver-driven array-level errors (e.g. the income total check) are nested
  // under `.root`; manual `setError('groups', ...)` calls use `.message`.
  const groupsError = form.formState.errors.groups
  const topLevelError = groupsError?.message ?? groupsError?.root?.message

  return (
  <>
    <div className='space-y-2'>
      <h2 ref={allocationHeadingRef} tabIndex={-1} className='text-lg font-semibold'>
        {t('heading_allocation')}
      </h2>
    </div>
    <FormProvider {...form}>
      <div className='grid gap-6 lg:grid-cols-12 lg:items-start'>
        <div className='space-y-4 lg:col-span-8'>
          {groups.map((group, groupIndex) => (
            <GroupCard
              key={groupIndex}
              group={group}
              groupIndex={groupIndex}
              categories={categories}
              totalIncome={totals.totalIncome}
            />
          ))}
          {topLevelError ? <FieldError>{topLevelError}</FieldError> : null}
        </div>
        <div className='lg:col-span-4 lg:sticky lg:top-24'>
          <BudgetAllocationSummary groups={groups} />
        </div>
      </div>
      </FormProvider>
      <StepFooter onBack={() => setStep('structure')} disabled={isPending} />
    </>
  )
}
