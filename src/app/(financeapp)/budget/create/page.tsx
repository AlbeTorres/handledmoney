import { FormWrapper } from '@/components/FormWrapper'
import { CreateBudgetForm } from '../_components/CreateBudgetForm'
import { getCategoriesByUserData } from '@/data-access/get-categories'

export default async function CreateBudgetPage() {


  const categories = await getCategoriesByUserData()

  if (!categories.success || !categories.data) {
    return null
  }
  const selectableCategories = categories.data.map(category => ({
    id: category.id,
    name: category.name,
    type: category.type,
    icon: category.icon ?? 'more_horizontal',
    color: category.color ?? '94a3b8',
  }))

  return (
    <FormWrapper
      title='Create budget'
      description='Define your budget and allocation plan before saving.'
      oldPath='/budget'
      oldPathTitle='Budgets'
      pathTitle='Create'
    >
      <CreateBudgetForm initialCategories={selectableCategories} />
    </FormWrapper>
  )
}
