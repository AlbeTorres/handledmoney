'use client'

import { Button } from '@/components/ui/button'
import { useConfirm } from '@/hooks/use-confirm'
import type { CreateBudgetValues } from '@/lib/schema'
import { CircleDollarSign, Plus, Trash2, WalletCards } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form'
import type { QuickTarget } from './BudgetStructureEditor'
import { CategoryCombobox, type BudgetCategory } from './CategoryCombobox'

export function BudgetStructureGroupCard({
  groupIndex,
  group,
  categories,
  selectedCategoryIds,
  incomeGroupCount,
  form,
  onRequestQuickCreate,
  onConfirmRemoveGroup,
}: {
  groupIndex: number
  group: CreateBudgetValues['groups'][number]
  categories: BudgetCategory[]
  selectedCategoryIds: string[]
  incomeGroupCount: number
  form: UseFormReturn<CreateBudgetValues>
  onRequestQuickCreate: (target: QuickTarget) => void
  onConfirmRemoveGroup: () => void
}) {
  const t = useTranslations('handledmoney.budget.form')
  const [ConfirmItem, confirmItem] = useConfirm(
    t('item_confirm_title'),
    t('item_confirm_description'),
  )
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `groups.${groupIndex}.items`,
  })
  const watchedGroup = useWatch({ control: form.control, name: `groups.${groupIndex}` }) ?? group

  if (!watchedGroup) return null

  const isOnlyIncomeGroup = watchedGroup.calculationType === 'income' && incomeGroupCount === 1
  const items = fields.map((field, index) => ({ ...field, ...watchedGroup.items[index] }))
  const groupsError = (form.formState.errors.groups ?? {}) as Record<
    string,
    { items?: Record<string, { categoryId?: { message?: string } }> }
  >

  const removeItem = async (index: number) => {
    if (await confirmItem()) remove(index)
  }

  return (
    <section className='overflow-hidden rounded-md border bg-card shadow-sm'>
      <ConfirmItem />
      <div className='flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3'>
        <div className='flex flex-col items-start gap-3'>
          <span className='inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1 text-xs text-muted-foreground'>
            {watchedGroup.calculationType === 'income' ? (
              <CircleDollarSign className='size-3.5 text-emerald-600' />
            ) : (
              <WalletCards className='size-3.5 text-sky-600' />
            )}
            {watchedGroup.calculationType === 'income'
              ? t('group_type_income')
              : t('group_type_outflow')}
          </span>
          <p className='h-8 max-w-56   font-semibold '>{watchedGroup.name}</p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onConfirmRemoveGroup}
          aria-label={t('delete_group')}
          disabled={isOnlyIncomeGroup}
          title={isOnlyIncomeGroup ? t('income_group_required') : undefined}
        >
          <Trash2 className='size-4' />
        </Button>
      </div>
      {items.length > 0 ? (
        <ul className='divide-y'>
          {items.map((item, itemIndex) => {
            const itemError = groupsError[groupIndex]?.items?.[itemIndex]?.categoryId?.message
            return (
              <li key={item.id} className='flex items-center gap-2 px-4 py-2'>
                <div className=''>
                  <CategoryCombobox
                    categories={categories}
                    calculationType={watchedGroup.calculationType}
                    selectedCategoryId={item.categoryId}
                    onSelect={id => {
                      form.setValue(`groups.${groupIndex}.items.${itemIndex}.categoryId`, id, {
                        shouldValidate: true,
                      })
                      form.setValue(`groups.${groupIndex}.items.${itemIndex}.plannedAmount`, 0)
                    }}
                    onCreate={name =>
                      onRequestQuickCreate({
                        groupIndex,
                        itemIndex,
                        calculationType: watchedGroup.calculationType,
                        name,
                      })
                    }
                    disabledCategoryIds={selectedCategoryIds}
                  />
                  {itemError && <p className='mt-1 text-sm text-destructive'>{itemError}</p>}
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  onClick={() => void removeItem(itemIndex)}
                  aria-label={t('remove_category')}
                >
                  <Trash2 className='size-4' />
                </Button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className='px-4 py-6 text-center'>
          <p className='text-sm font-medium text-muted-foreground'>{t('group_empty_title')}</p>
          <p className='mt-1 text-xs text-muted-foreground'>{t('group_empty_description')}</p>
        </div>
      )}
      <div className='border-t px-3 py-2'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => append({ categoryId: '', plannedAmount: 0 })}
        >
          <Plus className='size-4' />
          {t('add_category')}
        </Button>
      </div>
    </section>
  )
}
