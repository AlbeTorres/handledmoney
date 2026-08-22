'use client'

import { createBudgetAction } from '@/actions/budget/create-budget'
import {
  BudgetCreationStepper,
  type WizardStep,
} from '@/app/(financeapp)/budget/_components/BudgetCreationStepper'
import { FormActions } from '@/components/FormActions'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { useConfirm } from '@/hooks/use-confirm'
import {
  arePlansEqual,
  createTemplateGroups,
  normalizePlan,
  type BudgetTemplateId,
  type NormalizedPlan,
} from '@/lib/budget-plan-templates'
import { BudgetStructureSchema, CreateBudgetSchema, type CreateBudgetValues } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch, type Path } from 'react-hook-form'
import { toast } from 'sonner'
import { BudgetAllocationEditor } from '../app/(financeapp)/budget/_components/BudgetAllocationEditor'
import {
  BudgetStructureEditor,
  type QuickTarget,
} from '../app/(financeapp)/budget/_components/BudgetStructureEditor'
import type { BudgetCategory } from './CategoryCombobox'
import { QuickCreateCategoryDrawer } from './QuickCreateCategoryDrawer'
import TemplateBudgetSelect from './TemplateBudgetSelect'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

// Kept for existing consumers; new drafts must use createTemplateGroups for fresh values.
export const initialGroups = createTemplateGroups('starter')

// The step footers (Cancel / Back / Next) share the same layout across the three
// steps, so they are a small presentational helper owned by the orchestrator.
function StepFooter({
  onCancel,
  onBack,
  onNext,
  disabled,
}: {
  onCancel?: () => void
  onBack?: () => void
  onNext?: () => void
  disabled: boolean
}) {
  const t = useTranslations('handledmoney.budget.form')
  return (
    <div className='flex flex-wrap justify-end gap-2'>
      {onCancel && (
        <Button type='button' variant='ghost' onClick={onCancel} disabled={disabled}>
          {t('cancel')}
        </Button>
      )}
      {onBack && (
        <Button type='button' variant='ghost' onClick={onBack} disabled={disabled}>
          {t('back')}
        </Button>
      )}
      {onNext && (
        <Button type='button' onClick={() => void onNext()} disabled={disabled}>
          {t('next')}
        </Button>
      )}
    </div>
  )
}

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
              <>
                <div className='w-full md:max-w-md'>
                  <FieldGroup>
                    <Controller
                      name='name'
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field className='md:max-w-60' data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor='budget-name'>{t('name')}</FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              {...field}
                              id='budget-name'
                              placeholder={t('name_placeholder')}
                              disabled={isPending}
                              aria-invalid={fieldState.invalid}
                            />
                          </InputGroup>
                          {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                    <div className='grid gap-6 md:grid-cols-2'>
                      <Controller
                        name='startDate'
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor='budget-start-date'>{t('start_date')}</FieldLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant='outline'
                                  id='date-picker-simple'
                                  className='data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal'
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Select a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align='start'>
                                <Calendar
                                  mode='single'
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  defaultMonth={field.value}
                                />
                              </PopoverContent>
                            </Popover>
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                      <Controller
                        name='endDate'
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor='budget-end-date'>{t('end_date')}</FieldLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant='outline'
                                  id='budget-end-date'
                                  className='data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal'
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Select a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align='start'>
                                <Calendar
                                  mode='single'
                                  selected={field.value ?? undefined}
                                  onSelect={field.onChange}
                                  defaultMonth={field.value ?? undefined}
                                />
                              </PopoverContent>
                            </Popover>

                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </div>
                  </FieldGroup>
                </div>

                <TemplateBudgetSelect
                  value={templateId}
                  onValueChange={value => void changeTemplate(value)}
                  disabled={isPending}
                />
                <div className='flex items-start gap-2 rounded-md border w-fit bg-muted/50 p-3'>
                  <Info
                    aria-hidden='true'
                    className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                  />
                  <p className='text-sm text-muted-foreground'>
                    {templateId === 'blank' ? t('template_info_blank') : t('template_info_starter')}
                  </p>
                </div>
                <StepFooter
                  onCancel={cancel}
                  onNext={() => void goToStructure()}
                  disabled={isPending}
                />
              </>
            ) : step === 'structure' ? (
              <>
                <div className='space-y-2'>
                  <h2 ref={structureHeadingRef} tabIndex={-1} className='text-lg font-semibold'>
                    {t('heading_structure')}
                  </h2>
                </div>
                <BudgetStructureEditor
                  form={form}
                  categories={categories}
                  onRequestQuickCreate={setQuickTarget}
                />
                <StepFooter
                  onBack={() => setStep('setup')}
                  onNext={() => void goToAllocation()}
                  disabled={isPending}
                />
              </>
            ) : (
              <>
                <div className='space-y-2'>
                  <h2 ref={allocationHeadingRef} tabIndex={-1} className='text-lg font-semibold'>
                    {t('heading_allocation')}
                  </h2>
                </div>
                <BudgetAllocationEditor form={form} categories={categories} />
                <StepFooter onBack={() => setStep('structure')} disabled={isPending} />
              </>
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
