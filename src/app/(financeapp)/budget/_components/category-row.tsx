import { FieldError } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { getCategoryIncomePercentage, clampProgressPercentage } from "@/lib/budget-allocation"
import { CreateBudgetValues } from "@/lib/schema"
import { formatPercentage, getIconComponent } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { useFormContext, Controller } from "react-hook-form"
import { BudgetCategory } from "./CategoryCombobox"

interface CategoryRowProps {
  groupIndex: number
  category: BudgetCategory
  itemIndex: number
  totalIncome: number
  plannedAmount: number
}

export function CategoryRow({
  groupIndex,
  category,
  itemIndex,
  totalIncome,
  plannedAmount,
}: CategoryRowProps) {
  const t = useTranslations('handledmoney.budget.form')
  const { formState } = useFormContext<CreateBudgetValues>()
  const Icon = getIconComponent(category.icon)
  const realPercentage = getCategoryIncomePercentage(plannedAmount, totalIncome)
  const clamped = clampProgressPercentage(realPercentage)
  const amountError =
    formState.errors.groups?.[groupIndex]?.items?.[itemIndex]?.plannedAmount?.message

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
          aria-label={t('category_income_share', {
            category: category.name,
            percentage: formatPercentage(realPercentage),
          })}
          className='mt-1 h-2 w-full overflow-hidden rounded-full bg-muted'
        >
          <div className='h-full rounded-full bg-primary' style={{ width: `${clamped}%` }} />
        </div>
      </div>
      <Controller
        name={`groups.${groupIndex}.items.${itemIndex}.plannedAmount`}
        render={({ field }) => {
          const rawValue = Number.isNaN(field.value) || field.value === 0 ? '' : field.value
          return (
            <div className='w-full min-w-0 sm:w-32 sm:shrink-0'>
              <InputGroup>
                <InputGroupAddon>$</InputGroupAddon>
                <InputGroupInput
                  {...field}
                  value={rawValue}
                  onChange={event => {
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
