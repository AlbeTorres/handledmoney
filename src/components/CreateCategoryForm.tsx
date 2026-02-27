'use client'

import { createCategoryAction } from '@/actions/category/create-category'
import { ICONS } from '@/lib/data'
import { CategoryFormData, categorySchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { AppearanceSection } from './AppearanceSection'
import { CategoryPreview } from './CategoryPreview'
import { FormActions } from './FormActions'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { InputGroup, InputGroupInput } from './ui/input-group'

type CreateCategoryValues = z.infer<typeof categorySchema>

export function CreateCategoryForm() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const form = useForm<CreateCategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: 'more_horizontal',
      color: '94a3b8',
      type: 'expense',
    },
  })

  const watched = useWatch<CreateCategoryValues>({ control: form.control })

  const CurrentIcon = ICONS.find(i => i.name === watched.icon)?.icon || ICONS[0].icon

  const handleSubmit = async (data: CategoryFormData) => {
    setIsPending(true)
    try {
      const response = await createCategoryAction(data)
      if (response.success) {
        toast.success(response.message)
        router.push('/category')
        router.refresh()
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = useCallback(() => {
    form.reset()
    router.back()
  }, [form])

  return (
    <div className='bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden'>
      <div className='grid sm:grid-cols-2 sm:gap-4'>
        <CategoryPreview
          name={watched.name!}
          color={watched.color!}
          type={watched.type!}
          Icon={CurrentIcon}
        />
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='p-6 sm:p-8 space-y-8'>
            <FieldGroup>
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-create-account-name'>Account Name</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-create-account-name'
                        aria-invalid={fieldState.invalid}
                        placeholder='e.g., Main Savings'
                        autoComplete='off'
                        spellCheck={false}
                        disabled={isPending}
                      />
                    </InputGroup>
                    <FieldDescription>Must be a unique name for your records.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className='space-y-2'>
                <Controller
                  name='type'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='form-create-account-name'>Transaction Type</FieldLabel>
                      <div className='flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl'>
                        <button
                          type='button'
                          onClick={() => field.onChange('expense')}
                          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                            field.value === 'expense'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          Expense
                        </button>
                        <button
                          type='button'
                          onClick={() => field.onChange('income')}
                          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                            field.value === 'income'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          Income
                        </button>
                      </div>
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>

            <div className='border-t border-slate-100 dark:border-slate-800' />

            <AppearanceSection
              iconValue={form.watch('icon')}
              colorValue={form.watch('color')}
              onIconChange={icon => form.setValue('icon', icon, { shouldValidate: true })}
              onColorChange={color => form.setValue('color', color, { shouldValidate: true })}
              iconError={form.formState.errors.icon}
              colorError={form.formState.errors.color}
            />
          </div>

          <FormActions
            onCancel={handleCancel}
            isPending={isPending}
            text='Create Account'
            loadingText='Creating…'
          />
        </form>
      </div>
    </div>
  )
}
