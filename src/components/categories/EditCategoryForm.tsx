'use client'

import { deleteCategoryAction } from '@/actions/category/delete-category'
import { updateCategoryAction } from '@/actions/category/update-category'
import { useConfirm } from '@/hooks/use-confirm'
import { ICONS } from '@/lib/data'
import { UpdateCategorySchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { AppearanceSection } from '../AppearanceSection'
import { FormActions } from '../FormActions'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { InputGroup, InputGroupInput } from '../ui/input-group'
import { CategoryPreview } from './CategoryPreview'

type EditCategoryValues = z.infer<typeof UpdateCategorySchema>

// Internal schema for the form (full data needed)
const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(50).trim(),
  icon: z.string().min(1, { message: 'Please select an icon' }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Enter a valid hex color' }),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  parentId: z.string().uuid().optional().nullable(),
})

export function EditCategoryForm({ initialValues }: { initialValues: EditCategoryValues }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const [ConfirmationDialog, confirm] = useConfirm(
    'Delete Category',
    'Are you sure you want to delete this category? This action cannot be undone.',
  )

  const form = useForm<EditCategoryValues>({
    resolver: zodResolver(UpdateCategorySchema),
    defaultValues: initialValues,
  })

  const watched = useWatch<EditCategoryValues>({ control: form.control })
  const CurrentIcon = ICONS.find(i => i.name === watched.icon)?.icon || ICONS[0].icon

  const handleSubmit = async (data: z.infer<typeof UpdateCategorySchema>) => {
    setIsPending(true)
    try {
      const response = await updateCategoryAction(data)
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

  const handleDelete = async () => {
    const ok = await confirm()
    if (!ok) return

    setIsPending(true)
    try {
      const response = await deleteCategoryAction(initialValues.id)
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
    router.back()
  }, [router])

  return (
    <div className='bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden'>
      <ConfirmationDialog />
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
          <div className='flex justify-end items-center gap-2'>
            <button
              disabled={isPending}
              type='button'
              onClick={handleDelete}
              className='size-14 flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-2xl hover:bg-red-100 transition-all disabled:opacity-50'
            >
              <Trash2 className='size-6' />
            </button>
            <FormActions
              onCancel={handleCancel}
              isPending={isPending}
              text='Update Category'
              loadingText='Updating…'
            />
          </div>
        </form>
      </div>
    </div>
  )
}
