'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CreateBudgetValues } from '@/lib/schema'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { CategoryCombobox, type BudgetCategory } from './CategoryCombobox'

type Props = {
  groupIndex: number
  group: CreateBudgetValues['groups'][number]
  categories: BudgetCategory[]
  register: UseFormRegister<CreateBudgetValues>
  setValue: UseFormSetValue<CreateBudgetValues>
  onAddItem: () => void
  onRemoveGroup: () => void
  onCreateCategory: (itemIndex: number, name: string) => void
  onConfirmRemoveItem: (index: number) => void
}

export function BudgetPlanGroupTable({
  groupIndex,
  group,
  categories,
  register,
  setValue,
  onAddItem,
  onRemoveGroup,
  onCreateCategory,
  onConfirmRemoveItem,
}: Props) {
  const t = useTranslations('handledmoney.budget.form')
  return (
    <section className='overflow-hidden rounded-md border bg-card shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <Input
            {...register(`groups.${groupIndex}.name`)}
            aria-label={t('group_name')}
            className='h-8 max-w-56 border-0 bg-transparent px-0 font-semibold shadow-none focus-visible:ring-0'
          />
          <span className='rounded-md bg-background px-2 py-1 text-xs text-muted-foreground'>
            {group.calculationType === 'income' ? t('income') : t('outflow')}
          </span>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onRemoveGroup}
          aria-label={t('remove_group')}
        >
          <Trash2 className='size-4' />
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('category')}</TableHead>
            <TableHead className='w-40 text-right'>{t('amount')}</TableHead>
            <TableHead className='w-12' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {group.items.map((item, itemIndex) => (
            <TableRow key={`${item.categoryId}-${itemIndex}`}>
              <TableCell>
                <CategoryCombobox
                  categories={categories}
                  calculationType={group.calculationType}
                  selectedCategoryId={item.categoryId}
                  onSelect={id =>
                    setValue(`groups.${groupIndex}.items.${itemIndex}.categoryId`, id, {
                      shouldValidate: true,
                    })
                  }
                  onCreate={name => onCreateCategory(itemIndex, name)}
                />
              </TableCell>
              <TableCell>
                <Input
                  {...register(`groups.${groupIndex}.items.${itemIndex}.plannedAmount`, {
                    valueAsNumber: true,
                  })}
                  type='number'
                  min='0'
                  step='0.01'
                  className='text-right tabular-nums'
                  aria-label={t('amount')}
                />
              </TableCell>
              <TableCell>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  onClick={() => onConfirmRemoveItem(itemIndex)}
                  aria-label={t('remove_item')}
                >
                  <Trash2 className='size-4' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className='border-t px-3 py-2'>
        <Button type='button' variant='ghost' size='sm' onClick={onAddItem}>
          <Plus className='size-4' />
          {t('add_item')}
        </Button>
      </div>
    </section>
  )
}
