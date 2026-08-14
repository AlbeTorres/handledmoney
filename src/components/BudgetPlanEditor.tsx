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
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import type { BudgetCategory } from './CategoryCombobox'
import GroupEditor from './GroupEditor'

export type QuickTarget = {
  groupIndex: number
  itemIndex: number
  calculationType: 'income' | 'outflow'
} | null

export function BudgetPlanEditor({
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
  const [ConfirmGroup, confirmGroup] = useConfirm(
    t('group_confirm_title'),
    t('group_confirm_description'),
  )
  const [newGroup, setNewGroup] = useState({
    name: '',
    calculationType: 'outflow' as 'income' | 'outflow',
  })

  const addGroup = () => {
    if (!newGroup.name.trim()) return
    append({
      name: newGroup.name.trim(),
      calculationType: newGroup.calculationType,
      sortOrder: fields.length,
      items: [],
    })
    setNewGroup({ name: '', calculationType: 'outflow' })
  }
  const removeGroup = async (index: number) => {
    if (await confirmGroup()) remove(index)
  }
  return (
    <section className='space-y-4 '>
      <ConfirmGroup />
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>{t('plan')}</h2>
      </div>
      <div className='rounded-md border bg-muted/20 p-4 shadow-sm'>
        <div className='grid gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end'>
          <Field>
            <FieldLabel htmlFor='new-budget-group-name'>{t('group_name')}</FieldLabel>
            <Input
              id='new-budget-group-name'
              value={newGroup.name}
              onChange={event => setNewGroup(current => ({ ...current, name: event.target.value }))}
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
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
      </div>
      {fields.map((field, index) => (
        <GroupEditor
          key={field.id}
          groupIndex={index}
          form={form}
          categories={categories}
          onQuickCreate={onRequestQuickCreate}
          onRemoveGroup={() => void removeGroup(index)}
        />
      ))}
      {form.formState.errors.groups?.message && (
        <p className='text-sm text-destructive'>{String(form.formState.errors.groups.message)}</p>
      )}
    </section>
  )
}
