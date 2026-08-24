import { CreateBudgetValues } from "@/lib/schema"
import { CircleDollarSign, WalletCards } from "lucide-react"
import { BudgetCategory } from "./CategoryCombobox"
import { useTranslations } from "next-intl"
import { formatCurrency } from "@/lib/utils"
import { CategoryRow } from "./category-row"

interface GroupCardProps {
  group: CreateBudgetValues['groups'][number]
  groupIndex: number
  categories: BudgetCategory[]
  totalIncome: number
}

export function GroupCard({ group, groupIndex, categories, totalIncome }: GroupCardProps) {
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
          <span className='rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
            Expense
          </span>
        )}
        <span className='text-sm text-muted-foreground'>{t('group_total')}:</span>
        <span className='mono-data tabular-nums text-sm text-muted-foreground'>
          {formatCurrency(groupTotal)}
        </span>
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
