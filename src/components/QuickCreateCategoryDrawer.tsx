'use client'

import { createCategoryAction } from '@/actions/category/create-category'
import { ColorPicker } from '@/components/ColorPicker'
import { IconPicker } from '@/components/IconPicker'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { categorySchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import type { BudgetCategory } from './CategoryCombobox'
import { FormActions } from './FormActions'

type Values = z.infer<typeof categorySchema>

export function QuickCreateCategoryDrawer({
  open,
  onOpenChange,
  calculationType,
  name,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  calculationType: 'income' | 'outflow'
  name: string
  onCreated: (category: BudgetCategory) => void
}) {
  const t = useTranslations('handledmoney.budget.form')
  const [isPending, setIsPending] = useState(false)
  const categoryType = calculationType === 'income' ? 'income' : 'expense'
  const form = useForm<Values>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', icon: 'more_horizontal', color: '94a3b8', type: categoryType },
  })

  useEffect(() => {
    if (open) {
      form.reset({ name, icon: 'more_horizontal', color: '94a3b8', type: categoryType })
    }
  }, [categoryType, form, name, open])

  const submit = async (values: Values) => {
    setIsPending(true)
    try {
      const response = await createCategoryAction({ ...values, type: categoryType })
      if (!response.success || !response.data) {
        toast.error(response.message ?? t('error_generic'))
        return
      }
      const category = response.data
      onCreated({
        id: category.id,
        name: category.name,
        type: category.type,
        icon: category.icon ?? 'more_horizontal',
        color: category.color ?? '94a3b8',
      })
      toast.success(t('category_created'))
      form.reset({ name: '', icon: 'more_horizontal', color: '94a3b8', type: categoryType })
      onOpenChange(false)
    } catch {
      toast.error(t('error_generic'))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction='right'>
      <DrawerContent className='w-full sm:max-w-md overflow-y-auto'>
        <DrawerHeader>
          <DrawerTitle>{t('quick_category_title')}</DrawerTitle>
          <DrawerDescription>{t('quick_category_description')}</DrawerDescription>
        </DrawerHeader>
        <form onSubmit={form.handleSubmit(submit)} className='flex min-h-full flex-col'>
          <div className='space-y-6 px-4 pb-6'>
            <FieldGroup>
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='quick-category-name'>{t('category_name')}</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id='quick-category-name'
                        aria-invalid={fieldState.invalid}
                        disabled={isPending}
                      />
                    </InputGroup>
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Field>
                <FieldLabel>{t('category_type')}</FieldLabel>
                <p className='text-sm text-muted-foreground'>
                  {categoryType === 'income' ? t('income') : t('outflow')}
                </p>
              </Field>
              <Controller
                name='color'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t('category_color')}</FieldLabel>
                    <ColorPicker value={field.value} onChange={field.onChange} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='icon'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t('category_icon')}</FieldLabel>
                    <IconPicker value={field.value} onChange={field.onChange} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>
          <FormActions
            onCancel={() => onOpenChange(false)}
            isPending={isPending}
            text={t('save_category')}
            loadingText={t('saving_category')}
            cancelText={t('cancel')}
          />
        </form>
      </DrawerContent>
    </Drawer>
  )
}
