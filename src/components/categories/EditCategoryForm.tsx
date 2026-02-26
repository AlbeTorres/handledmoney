'use client'

import { deleteCategoryAction } from '@/actions/category/delete-category'
import { updateCategoryAction } from '@/actions/category/update-category'
import { ColorPicker } from '@/components/ColorPicker'
import { IconPicker } from '@/components/IconPicker'
import { useConfirm } from '@/hooks/use-confirm'
import { ICONS } from '@/lib/data'
import { CategorySelect } from '@/repository/categories'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

interface EditCategoryFormProps {
  initialData: CategorySelect
  availableParents: CategorySelect[]
}

// Internal schema for the form (full data needed)
const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(50).trim(),
  icon: z.string().min(1, { message: 'Please select an icon' }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Enter a valid hex color' }),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  parentId: z.string().uuid().optional().nullable(),
})

export function EditCategoryForm({ initialData, availableParents }: EditCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [ConfirmationDialog, confirm] = useConfirm(
    'Delete Category',
    'Are you sure you want to delete this category? This action cannot be undone.',
  )

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      icon: initialData.icon || 'more_horizontal',
      color: initialData.color || '#94a3b8',
      type: initialData.type,
      parentId: initialData.parentId,
    },
  })

  const watchedValues = watch()
  const CurrentIcon = ICONS.find(i => i.name === watchedValues.icon)?.icon || ICONS[0].icon

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await updateCategoryAction({
        id: initialData.id,
        ...data,
      })
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
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const ok = await confirm()
    if (!ok) return

    setIsSubmitting(true)
    try {
      const response = await deleteCategoryAction(initialData.id)
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
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8 max-w-2xl mx-auto'>
      <ConfirmationDialog />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='space-y-6'>
          {/* Name */}
          <div className='space-y-2'>
            <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
              Category Name
            </label>
            <input
              {...register('name')}
              className='w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all'
            />
            {errors.name && (
              <p className='text-xs text-red-500 font-medium'>{errors.name.message}</p>
            )}
          </div>

          {/* Type Toggle */}
          <div className='space-y-2'>
            <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
              Transaction Type
            </label>
            <Controller
              name='type'
              control={control}
              render={({ field }) => (
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
              )}
            />
          </div>

          {/* Parent selection */}
          <div className='space-y-2'>
            <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
              Parent Category (Optional)
            </label>
            <select
              {...register('parentId')}
              className='w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm appearance-none transition-all'
            >
              <option value=''>None (Is a Parent Category)</option>
              {availableParents
                .filter(
                  p => p.id !== initialData.id && !p.parentId && p.type === watchedValues.type,
                )
                .map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
            </select>
            <p className='text-[10px] text-slate-400 font-medium px-1'>
              Only root categories can be parents.
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          {/* Icon Picker */}
          <div className='space-y-2'>
            <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
              Category Icon
            </label>
            <div className='p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl'>
              <Controller
                name='icon'
                control={control}
                render={({ field }) => (
                  <div className='max-h-48 overflow-y-auto custom-scrollbar px-1'>
                    <IconPicker value={field.value} onChange={field.onChange} />
                  </div>
                )}
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className='space-y-2'>
            <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
              Theme Color
            </label>
            <div className='p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl'>
              <Controller
                name='color'
                control={control}
                render={({ field }) => (
                  <ColorPicker
                    value={field.value.replace('#', '')}
                    onChange={hex => field.onChange(`#${hex}`)}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className='pt-8 border-t border-slate-100 dark:border-slate-800'>
        <div className='max-w-sm mx-auto'>
          <label className='block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center'>
            Live Preview
          </label>
          <div
            className='flex items-center p-5 rounded-2xl border transition-all shadow-sm'
            style={{
              backgroundColor: watchedValues.color + '08',
              borderColor: watchedValues.color + '30',
            }}
          >
            <div
              className='size-14 rounded-2xl flex items-center justify-center text-white mr-5 shadow-lg shadow-black/5 transition-all'
              style={{
                backgroundColor: watchedValues.color,
                boxShadow: `0 10px 20px -5px ${watchedValues.color}40`,
              }}
            >
              <CurrentIcon className='size-7' />
            </div>
            <div>
              <h4 className='font-bold text-base' style={{ color: '#0f172a' }}>
                {watchedValues.name || 'Category Name'}
              </h4>
              <p className='text-xs font-semibold' style={{ color: watchedValues.color }}>
                {watchedValues.type.charAt(0).toUpperCase() + watchedValues.type.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='pt-8 flex gap-4'>
        <button
          disabled={isSubmitting}
          type='submit'
          className='flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50'
        >
          {isSubmitting ? (
            <div className='size-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
          ) : (
            <Save className='size-6' />
          )}
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          disabled={isSubmitting}
          type='button'
          onClick={handleDelete}
          className='size-14 flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-2xl hover:bg-red-100 transition-all disabled:opacity-50'
        >
          <Trash2 className='size-6' />
        </button>
      </div>
    </form>
  )
}
