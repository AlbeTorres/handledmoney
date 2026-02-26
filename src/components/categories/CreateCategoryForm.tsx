'use client'

import { createCategoryAction } from '@/actions/category/create-category'
import { ColorPicker } from '@/components/ColorPicker'
import { IconPicker } from '@/components/IconPicker'
import { ICONS } from '@/lib/data'
import { CategoryFormData, categorySchema } from '@/lib/schema'
import { CategorySelect } from '@/repository/categories'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface CreateCategoryFormProps {
  availableParents: CategorySelect[]
}

export function CreateCategoryForm({ availableParents }: CreateCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: 'more_horizontal',
      color: '#94a3b8',
      type: 'expense',
      parentId: null,
    },
  })

  const watchedValues = watch()
  const CurrentIcon = ICONS.find(i => i.name === watchedValues.icon)?.icon || ICONS[0].icon

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
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
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8 max-w-2xl mx-auto'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='space-y-6'>
          {/* Name */}
          <div className='space-y-2'>
            <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
              Category Name
            </label>
            <input
              {...register('name')}
              placeholder='e.g. Food & Dining'
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
                .filter(p => !p.parentId && p.type === watchedValues.type)
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
            {errors.icon && (
              <p className='text-xs text-red-500 font-medium'>{errors.icon.message}</p>
            )}
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

      <div className='pt-8'>
        <button
          disabled={isSubmitting}
          type='submit'
          className='w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50'
        >
          {isSubmitting ? (
            <div className='size-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
          ) : (
            <Plus className='size-6' />
          )}
          {isSubmitting ? 'Creating...' : 'Create Category'}
        </button>
      </div>
    </form>
  )
}
