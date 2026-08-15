'use client'

import { createBudgetAction } from '@/actions/budget/create-budget'
import { FormActions } from '@/components/FormActions'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { CreateBudgetSchema, type CreateBudgetValues } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { BudgetPlanEditor, type QuickTarget } from './BudgetPlanEditor'
import type { BudgetCategory } from './CategoryCombobox'
import { QuickCreateCategoryDrawer } from './QuickCreateCategoryDrawer'
import TemplateBudgetSelect from './TemplateBudgetSelect'

export const initialGroups: CreateBudgetValues['groups'] = [
  { name: 'Income', calculationType: 'income', sortOrder: 0, items: [] },
  { name: 'Bills', calculationType: 'outflow', sortOrder: 1, items: [] },
  { name: 'Variable Expenses', calculationType: 'outflow', sortOrder: 2, items: [] },
  { name: 'Debt', calculationType: 'outflow', sortOrder: 3, items: [] },
  { name: 'Savings', calculationType: 'outflow', sortOrder: 4, items: [] },
  { name: 'Investments', calculationType: 'outflow', sortOrder: 5, items: [] },
]

export function CreateBudgetForm({ initialCategories }: { initialCategories: BudgetCategory[] }) {
  const t = useTranslations('handledmoney.budget.form')
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [categories, setCategories] = useState(initialCategories)
  const [quickTarget, setQuickTarget] = useState<QuickTarget>(null)

  const form = useForm<CreateBudgetValues>({
    resolver: zodResolver(CreateBudgetSchema),
    defaultValues: { name: '', startDate: new Date(), endDate: null, groups: initialGroups },
  })
  const groups = useWatch({ control: form.control, name: 'groups' })

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
        <form onSubmit={form.handleSubmit(submit)}>
          <div className='space-y-8 p-6 sm:p-8'>
            <FieldGroup>
              <div className='grid gap-6'>
                <Controller
                  name='name'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='budget-name'>{t('name')}</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id='budget-name'
                          placeholder={t('name_placeholder')}
                          disabled={isPending}
                        />
                      </InputGroup>
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
              <div className='grid gap-6 md:grid-cols-2'>
                <Controller
                  name='startDate'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='budget-start-date'>{t('start_date')}</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id='budget-start-date'
                          type='date'
                          value={
                            field.value ? new Date(field.value).toISOString().slice(0, 10) : ''
                          }
                          onChange={event =>
                            field.onChange(
                              event.target.value
                                ? new Date(`${event.target.value}T00:00:00`)
                                : undefined,
                            )
                          }
                          disabled={isPending}
                        />
                      </InputGroup>
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
                      <InputGroup>
                        <InputGroupInput
                          id='budget-end-date'
                          type='date'
                          value={
                            field.value ? new Date(field.value).toISOString().slice(0, 10) : ''
                          }
                          onChange={event =>
                            field.onChange(
                              event.target.value
                                ? new Date(`${event.target.value}T00:00:00`)
                                : null,
                            )
                          }
                          disabled={isPending}
                        />
                      </InputGroup>
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
            <TemplateBudgetSelect />
            <BudgetPlanEditor
              form={form}
              categories={categories}
              onRequestQuickCreate={setQuickTarget}
            />
          </div>
          <FormActions
            onCancel={cancel}
            isPending={isPending}
            isSubmitDisabled={!groups?.length}
            text={t('create_button')}
            loadingText={t('creating')}
          />
        </form>
      </div>
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
