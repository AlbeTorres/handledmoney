'use client'

import type { BudgetCategory } from '@/components/CategoryCombobox'
import { BudgetAllocationSummary } from '@/components/BudgetAllocationSummary'
import { FieldError } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { clampProgressPercentage, getBudgetAllocationTotals, getCategoryIncomePercentage } from '@/lib/budget-allocation'
import type { CreateBudgetValues } from '@/lib/schema'
import { getIconComponent } from '@/lib/utils'
import { CircleDollarSign, WalletCards } from 'lucide-react'
import { Controller, FormProvider, useFormContext, type UseFormReturn } from 'react-hook-form'
import { useTranslations } from 'next-intl'

// Local formatter, consistent with the en-US/USD pattern used across the
// budget components. Configurable currency is out of scope for now.
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

// Progress bars use the REAL percentage as visible text (it may exceed 100%),
// while the bar fill is clamped so it never overflows its track.
const formatPercentage = (percentage: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(percentage) + '%'

interface GroupCardProps {
  group: CreateBudgetValues['groups'][number]
  groupIndex: number
  categories: BudgetCategory[]
  totalIncome: number
}

function GroupCard({ group, groupIndex, categories, totalIncome }: GroupCardProps) {
  const t = useTranslations('handledmoney.budget.form')
  const categoryById = new Map(categories.map(category => [category.id, category]))

  const entries: Array<{
    item: CreateBudgetValues['groups'][number]['items'][number]
    itemIndex: number
    category: BudgetCategory
  }> = []
  group.items.forEach((item, itemIndex) => {
    const category = categoryById.get(item.categoryId)
    if (category) entries.push({ item, itemIndex, category })
  })

  const groupTotal = group.items.reduce((sum, item) => sum + item.plannedAmount, 0)

  return (
    <section className='rounded-md border bg-card p-4'>
      <div className='flex flex-wrap items-center gap-2'>
        {group.calculationType === 'income' ? (
          <CircleDollarSign className='size-5 shrink-0 text-primary' aria-hidden='true' />
        ) : (
          <WalletCards className='size-5 shrink-0 text-primary' aria-hidden='true' />
        )}
        <h3 className='text-base font-medium'>{group.name}</h3>
        {group.calculationType !== 'income' && (
          <span className='rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>Expense</span>
        )}
        <span className='text-sm text-muted-foreground'>{t('group_total')}:</span>
        <span className='mono-data tabular-nums text-sm text-muted-foreground'>{formatCurrency(groupTotal)}</span>
      </div>
      {entries.length > 0 && (
        <ul className='mt-3 space-y-3'>
          {entries.map(({ item, itemIndex, category }) => (
            <CategoryRow
              key={itemIndex}
              groupIndex={groupIndex}
              category={category}
              itemIndex={itemIndex}
              totalIncome={totalIncome}
              plannedAmount={item.plannedAmount}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

interface CategoryRowProps {
  groupIndex: number
  category: BudgetCategory
  itemIndex: number
  totalIncome: number
  plannedAmount: number
}

function CategoryRow({ groupIndex, category, itemIndex, totalIncome, plannedAmount }: CategoryRowProps) {
  const t = useTranslations('handledmoney.budget.form')
  const { formState } = useFormContext<CreateBudgetValues>()
  const Icon = getIconComponent(category.icon)
  const realPercentage = getCategoryIncomePercentage(plannedAmount, totalIncome)
  const clamped = clampProgressPercentage(realPercentage)
  const amountError = formState.errors.groups?.[groupIndex]?.items?.[itemIndex]?.plannedAmount?.message

  return (
    <li className='flex flex-wrap items-center gap-x-3 gap-y-2'>
      <span
        className='flex size-9 shrink-0 items-center justify-center rounded-full'
        style={{ backgroundColor: `#${category.color}` }}
      >
        <Icon className='size-4 text-white' aria-hidden='true' />
      </span>
      <div className='min-w-0 flex-1'>
        <div className='flex items-baseline justify-between gap-2'>
          <span className='truncate text-sm font-medium'>{category.name}</span>
          <span className='mono-data tabular-nums text-sm'>{formatPercentage(realPercentage)}</span>
        </div>
        <div
          role='progressbar'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clamped}
          aria-label={t('category_income_share', { category: category.name, percentage: formatPercentage(realPercentage) })}
          className='mt-1 h-2 w-full overflow-hidden rounded-full bg-muted'
        >
          <div
            className='h-full rounded-full bg-primary'
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
      <Controller
        name={`groups.${groupIndex}.items.${itemIndex}.plannedAmount`}
        render={({ field }) => {
          const rawValue = Number.isNaN(field.value) ? '' : field.value
          return (
            <div className='w-full min-w-0 sm:w-32 sm:shrink-0'>
              <InputGroup>
                <InputGroupAddon>$</InputGroupAddon>
                <InputGroupInput
                  {...field}
                  value={rawValue}
                  onChange={(event) => {
                    const parsed = event.target.valueAsNumber
                    field.onChange(Number.isNaN(parsed) ? Number.NaN : parsed)
                  }}
                  type='number'
                  inputMode='decimal'
                  min={0}
                  step='0.01'
                  placeholder='0.00'
                  aria-label={t('amount_for_category', { category: category.name })}
                  className='mono-data tabular-nums'
                />
              </InputGroup>
              {amountError ? <FieldError errors={[{ message: amountError }]} /> : null}
            </div>
          )
        }}
      />
    </li>
  )
}

interface BudgetAllocationEditorProps {
  form: UseFormReturn<CreateBudgetValues>
  categories: BudgetCategory[]
}

export function BudgetAllocationEditor({ form, categories }: BudgetAllocationEditorProps) {
  const groups = form.watch('groups') ?? []
  const totals = getBudgetAllocationTotals(groups)
  // Resolver-driven array-level errors (e.g. the income total check) are nested
  // under `.root`; manual `setError('groups', ...)` calls use `.message`.
  const groupsError = form.formState.errors.groups
  const topLevelError = groupsError?.message ?? groupsError?.root?.message

  return (
    <FormProvider {...form}>
      <div className='grid gap-6 lg:grid-cols-12 lg:items-start'>
        <div className='space-y-4 lg:col-span-8'>
          {groups.map((group, groupIndex) => (
            <GroupCard
              key={groupIndex}
              group={group}
              groupIndex={groupIndex}
              categories={categories}
              totalIncome={totals.totalIncome}
            />
          ))}
          {topLevelError ? <FieldError>{topLevelError}</FieldError> : null}
        </div>
        <div className='lg:col-span-4 lg:sticky lg:top-24'>
          <BudgetAllocationSummary groups={groups} />
        </div>
      </div>
    </FormProvider>
  )
}
