import { useConfirm } from '@/hooks/use-confirm'
import { CreateBudgetValues } from '@/lib/schema'
import { useTranslations } from 'next-intl'
import { UseFormReturn, useFieldArray, useWatch } from 'react-hook-form'
import type { QuickTarget } from './BudgetPlanEditor'
import { BudgetPlanGroupTable } from './BudgetPlanGroupTable'
import type { BudgetCategory } from './CategoryCombobox'

export default function GroupEditor({
  groupIndex,
  form,
  categories,
  onQuickCreate,
  onRemoveGroup,
}: {
  groupIndex: number
  form: UseFormReturn<CreateBudgetValues>
  categories: BudgetCategory[]
  onQuickCreate: (target: QuickTarget) => void
  onRemoveGroup: () => void
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
  const group = useWatch({ control: form.control, name: `groups.${groupIndex}` })

  if (!group) return null
  const removeItem = async (index: number) => {
    if (await confirmItem()) remove(index)
  }
  return (
    <>
      <ConfirmItem />
      <BudgetPlanGroupTable
        groupIndex={groupIndex}
        group={{
          ...group,
          items: fields.map((field, index) => ({ ...field, ...group.items[index] })),
        }}
        categories={categories}
        register={form.register}
        setValue={form.setValue}
        onAddItem={() => append({ categoryId: '', plannedAmount: 0 })}
        onRemoveGroup={onRemoveGroup}
        onCreateCategory={itemIndex =>
          onQuickCreate({ groupIndex, itemIndex, calculationType: group.calculationType })
        }
        onConfirmRemoveItem={removeItem}
      />
    </>
  )
}
