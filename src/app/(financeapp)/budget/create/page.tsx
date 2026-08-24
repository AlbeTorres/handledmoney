import { FormWrapper } from '@/components/FormWrapper'
import { auth } from '@/lib/auth'
import { getCategoriesByUserId } from '@/repository/categories'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { CreateBudgetForm } from '../_components/CreateBudgetForm'

export default async function CreateBudgetPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user.id) redirect('/auth/login')

  const categories = await getCategoriesByUserId(session.user.id)
  const selectableCategories = categories.map(category => ({
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
