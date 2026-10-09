'use client'

import { createCategoryAction } from '@/actions/category/create-category'
import { ICONS } from '@/lib/data'
import { CategoryFormData, categorySchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { AppearanceSection } from '@/components/shared/AppearanceSection'
import { CategoryPreview } from '@/app/(financeapp)/category/components/CategoryPreview'
import { FormActions } from '@/components/shared/FormActions'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'

type CreateCategoryValues = z.infer<typeof categorySchema>

export function CreateCategoryForm() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const t = useTranslations('handledmoney.category')

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
      toast.error(t('form.error_generic'))
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = useCallback(() => {
    form.reset()
    router.back()
  }, [form])

  return (
    <div className='rounded-xl border border-border bg-card overflow-hidden'>
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
                    <FieldLabel htmlFor='form-create-category-name'>
                      {t('form.category_name')}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='form-create-category-name'
                        aria-invalid={fieldState.invalid}
                        placeholder={t('form.category_name_placeholder')}
                        autoComplete='off'
                        spellCheck={false}
                        disabled={isPending}
                      />
                    </InputGroup>
                    <FieldDescription>{t('form.category_name_description')}</FieldDescription>
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
                      <FieldLabel htmlFor='form-create-category-type'>
                        {t('form.transaction_type')}
                      </FieldLabel>
                      <div className='flex gap-2 p-1.5 bg-muted rounded-2xl'>
                        <button
                          type='button'
                          onClick={() => field.onChange('expense')}
                          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-colors ${
                            field.value === 'expense'
                              ? 'bg-background text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {t('form.type_expense')}
                        </button>
                        <button
                          type='button'
                          onClick={() => field.onChange('income')}
                          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-colors ${
                            field.value === 'income'
                              ? 'bg-background text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {t('form.type_income')}
                        </button>
                      </div>
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>

            <div className='border-t border-border' />

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
            text={t('form.create_button')}
            loadingText={t('form.creating')}
          />
        </form>
      </div>
    </div>
  )
}
