'use client'
import { useTranslations } from 'next-intl'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { createBudgetAction } from '@/actions/budget/create-budget'

import { FormActions } from '@/components/FormActions'

import { useConfirm } from '@/hooks/use-confirm'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch, type Path } from 'react-hook-form'

import {
  arePlansEqual,
  createTemplateGroups,
  normalizePlan,
  type BudgetTemplateId,
  type NormalizedPlan,
} from '@/lib/budget-plan-templates'
import { BudgetStructureSchema, CreateBudgetSchema, type CreateBudgetValues } from '@/lib/schema'

import { BudgetAllocationEditor } from './BudgetAllocationEditor'
import { BudgetCreationStepper, type WizardStep } from './BudgetCreationStepper'
import { BudgetStructureEditor, type QuickTarget } from './BudgetStructureEditor'
import type { BudgetCategory } from './CategoryCombobox'
import { QuickCreateCategoryDrawer } from './QuickCreateCategoryDrawer'
import { SetupStep } from './createsteps/setup-step'


// Kept for existing consumers; new drafts must use createTemplateGroups for fresh values.
export const initialGroups = createTemplateGroups('starter')

// The step footers (Cancel / Back / Next) share the same layout across the three
// steps, so they are a small presentational helper owned by the orchestrator.

export function CreateBudgetForm({ initialCategories }: { initialCategories: BudgetCategory[] }) {
  const t = useTranslations('handledmoney.budget.form')
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [step, setStep] = useState<WizardStep>('setup')
  const [categories, setCategories] = useState(initialCategories)
  const [quickTarget, setQuickTarget] = useState<QuickTarget>(null)
  const [templateId, setTemplateId] = useState<BudgetTemplateId>('starter')
  const committedPlanRef = useRef<NormalizedPlan>(normalizePlan(createTemplateGroups('starter')))
  const setupHeadingRef = useRef<HTMLHeadingElement>(null)
  const structureHeadingRef = useRef<HTMLHeadingElement>(null)
  const allocationHeadingRef = useRef<HTMLHeadingElement>(null)
  const form = useForm<CreateBudgetValues>({
    resolver: zodResolver(CreateBudgetSchema),
    defaultValues: {
      name: '',
      startDate: new Date(),
      endDate: undefined,
      groups: createTemplateGroups('starter'),
    },
  })
  const { replace } = useFieldArray({ control: form.control, name: 'groups' })
  const groups = useWatch({ control: form.control, name: 'groups' })
  const [ConfirmReplace, confirmReplace] = useConfirm(
    t('template_replace_title'),
    t('template_replace_description'),
    t('template_replace_confirm'),
    t('template_replace_cancel'),
  )

  useEffect(() => {
    if (step === 'setup') {
      setupHeadingRef.current?.focus()
    } else if (step === 'structure') {
      structureHeadingRef.current?.focus()
    } else {
      allocationHeadingRef.current?.focus()
    }
  }, [step])

  const commitTemplate = (nextTemplateId: BudgetTemplateId) => {
    const nextGroups = createTemplateGroups(nextTemplateId)
    replace(nextGroups)
    setTemplateId(nextTemplateId)
    committedPlanRef.current = normalizePlan(nextGroups)
  }

  const changeTemplate = async (nextTemplateId: BudgetTemplateId) => {
    if (nextTemplateId === templateId) return
    const currentPlan = normalizePlan(form.getValues('groups') ?? [])
    if (!arePlansEqual(currentPlan, committedPlanRef.current) && !(await confirmReplace())) return
    commitTemplate(nextTemplateId)
  }

  const goToStructure = async () => {
    const valid = await form.trigger(['name', 'startDate', 'endDate'], { shouldFocus: true })
    if (valid) setStep('structure')
  }

  const goToAllocation = async () => {
    const result = BudgetStructureSchema.safeParse(form.getValues('groups'))
    if (!result.success) {
      form.clearErrors('groups')
      for (const issue of result.error.issues) {
        const segments = issue.path.map(part => String(part))
        const withoutFieldName = segments[0] === 'groups' ? segments.slice(1) : segments
        const path = ['groups', ...withoutFieldName].join('.')
        form.setError(path as Path<CreateBudgetValues>, { type: 'custom', message: issue.message })
      }
      return
    }
    form.clearErrors('groups')
    setStep('allocation')
  }

  const submit = async (data: CreateBudgetValues) => {
    setIsPending(true)
    try {
      const response = await createBudgetAction({
        ...data,
        groups: data.groups.map((group, sortOrder) => ({ ...group, sortOrder })),
      })
      if (!response.success || !response.data) {
        toast.error(response.message ?? t('error_generic'))
        return
      }
      toast.success(t('success'))
      router.push(`/budget/${response.data.id}`)
      router.refresh()
    } catch {
      toast.error(t('error_generic'))
    } finally {
      setIsPending(false)
    }
  }

  const cancel = useCallback(() => {
    form.reset()
    router.back()
  }, [form, router])

  const onCategoryCreated = (category: BudgetCategory) => {
    setCategories(current => [...current, category])
    if (quickTarget && quickTarget.itemIndex >= 0) {
      form.setValue(
        `groups.${quickTarget.groupIndex}.items.${quickTarget.itemIndex}.categoryId`,
        category.id,
        { shouldValidate: true },
      )
    }
    setQuickTarget(null)
  }

  return (
    <>
      <div className='overflow-hidden rounded-md border bg-card shadow-sm'>
        <form onSubmit={form.handleSubmit(submit)} noValidate>
          <div className='space-y-8 p-6 sm:p-8'>
            <BudgetCreationStepper currentStep={step} />
            {step === 'setup' ? (
              <SetupStep
                form={form}
                templateId={templateId}
                changeTemplate={changeTemplate}
                goToStructure={goToStructure}
                cancel={cancel}
                isPending={isPending}
              />
            ) : step === 'structure' ? (
              <BudgetStructureEditor
                form={form}
                categories={categories}
                onRequestQuickCreate={setQuickTarget}
                isPending={isPending}
                goToAllocation={goToAllocation}
                structureHeadingRef={structureHeadingRef}
                setStep={setStep}
              />
            ) : (
                <BudgetAllocationEditor form={form} categories={categories} setStep={setStep} allocationHeadingRef={allocationHeadingRef} isPending={isPending} />

            )}
          </div>
          {step === 'allocation' && (
            <FormActions
              onCancel={cancel}
              isPending={isPending}
              isSubmitDisabled={!groups?.length}
              text={t('create_button')}
              loadingText={t('creating')}
            />
          )}
        </form>
      </div>
      <ConfirmReplace />
      <QuickCreateCategoryDrawer
        open={quickTarget !== null && quickTarget.itemIndex >= 0}
        onOpenChange={open => {
          if (!open) setQuickTarget(null)
        }}
        calculationType={quickTarget?.calculationType ?? 'outflow'}
        name={quickTarget?.name ?? ''}
        onCreated={onCategoryCreated}
      />
    </>
  )
}
