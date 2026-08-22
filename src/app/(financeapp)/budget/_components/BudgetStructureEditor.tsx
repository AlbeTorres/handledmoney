'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConfirm } from '@/hooks/use-confirm'
import type { CreateBudgetValues } from '@/lib/schema'
import { CircleDollarSign, CirclePlus, Plus, WalletCards } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form'
import type { BudgetCategory } from '../../../../components/CategoryCombobox'
import { BudgetStructureGroupCard } from './BudgetStructureGroupCard'

export type QuickTarget = {
  groupIndex: number
  itemIndex: number
  calculationType: 'income' | 'outflow'
  name: string
} | null

export function BudgetStructureEditor({
  form,
  categories,
  onRequestQuickCreate,
}: {
  form: UseFormReturn<CreateBudgetValues>
  categories: BudgetCategory[]
  onRequestQuickCreate: (target: QuickTarget) => void
}) {
  const t = useTranslations('handledmoney.budget.form')
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'groups' })
  const groups = useWatch({ control: form.control, name: 'groups' })
  const [ConfirmGroup, confirmGroup] = useConfirm(
    t('group_confirm_title'),
    t('group_confirm_description'),
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: '',
    calculationType: 'outflow' as 'income' | 'outflow',
  })

  const incomeGroupCount = useMemo(
    () => groups.filter(group => group.calculationType === 'income').length,
    [groups],
  )
  const selectedCategoryIds = useMemo(
    () =>
      groups
        .flatMap(group => group.items.map(item => item.categoryId))
        .filter(categoryId => categoryId !== ''),
    [groups],
  )

  const addGroup = () => {
    if (!newGroup.name.trim()) return
    append({
      name: newGroup.name.trim(),
      calculationType: newGroup.calculationType,
      sortOrder: fields.length,
      items: [],
    })
    setNewGroup({ name: '', calculationType: 'outflow' })
    setCreateOpen(false)
  }
  const removeGroup = async (index: number) => {
    if (await confirmGroup()) remove(index)
  }

  const categoryCount = selectedCategoryIds.length
  const incomeReady = groups.some(
    group => group.calculationType === 'income' && group.items.some(item => item.categoryId !== ''),
  )

  return (
    <section className='space-y-4 '>
      <ConfirmGroup />
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>{t('plan')}</h2>
      </div>
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start'>
        <div className='space-y-4'>
          {fields.map((field, groupIndex) => (
            <BudgetStructureGroupCard
              key={field.id}
              groupIndex={groupIndex}
              group={groups[groupIndex]}
              categories={categories}
              selectedCategoryIds={selectedCategoryIds}
              incomeGroupCount={incomeGroupCount}
              form={form}
              onRequestQuickCreate={onRequestQuickCreate}
              onConfirmRemoveGroup={() => void removeGroup(groupIndex)}
            />
          ))}
          <>
            {createOpen ? (
              <div className='grid gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end rounded-md border shadow-sm bg-muted/30 px-4 py-3'>
                <Field>
                  <FieldLabel htmlFor='new-budget-group-name'>{t('group_name')}</FieldLabel>
                  <Input
                    className='bg-card'
                    id='new-budget-group-name'
                    value={newGroup.name}
                    onChange={event =>
                      setNewGroup(current => ({ ...current, name: event.target.value }))
                    }
                    placeholder={t('group_name_placeholder')}
                  />
                </Field>
                <Field>
                  <FieldLabel>{t('group_type')}</FieldLabel>
                  <Select
                    value={newGroup.calculationType}
                    onValueChange={value =>
                      setNewGroup(current => ({
                        ...current,
                        calculationType: value as 'income' | 'outflow',
                      }))
                    }
                  >
                    <SelectTrigger className='w-full bg-card' aria-label={t('group_type')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='bg-card'>
                      <SelectItem value='income'>{t('income')}</SelectItem>
                      <SelectItem value='outflow'>{t('outflow')}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Button type='button' onClick={addGroup}>
                  <Plus className='size-4' />
                  {t('add_group')}
                </Button>
              </div>
            ) : (
              <button
                className='flex flex-col w-full items-center text-lg justify-center  text-primary rounded-md border border-primary border-dashed p-4 hover:bg-primary/20  hover:text-green-700 hover:border-green-700 duration-300 transition-all'
                onClick={() => setCreateOpen(true)}
              >
                <CirclePlus className='size-4' />
                {t('create_group')}
              </button>
            )}
          </>
        </div>
        <aside className='rounded-md border bg-muted/20 p-4 lg:sticky lg:top-24'>
          <h3 className='text-sm font-semibold'>{t('summary_title')}</h3>
          <dl className='mt-3 space-y-2 text-sm'>
            <div className='flex items-center justify-between gap-2'>
              <dt className='text-muted-foreground'>
                {t('summary_groups', { count: groups.length })}
              </dt>
            </div>
            <div className='flex items-center justify-between gap-2'>
              <dt className='text-muted-foreground'>
                {t('summary_categories', { count: categoryCount })}
              </dt>
            </div>
            <div className='flex items-center gap-1.5 border-t pt-2'>
              {incomeReady ? (
                <CircleDollarSign className='size-4 shrink-0 text-emerald-600' />
              ) : (
                <WalletCards className='size-4 shrink-0 text-sky-600' />
              )}
              <dt className='text-muted-foreground'>
                {incomeReady ? t('summary_income_ready') : t('summary_income_pending')}
              </dt>
            </div>
          </dl>
        </aside>
      </div>
      {form.formState.errors.groups?.message && (
        <p className='text-sm text-destructive'>{String(form.formState.errors.groups.message)}</p>
      )}
    </section>
  )
}
