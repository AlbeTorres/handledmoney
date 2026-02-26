import { getOrSeedCategories } from '@/actions/category/get-categories'
import { CreateCategoryForm } from '@/components/categories/CreateCategoryForm'
import { FormWrapper } from '@/components/FormWrapper'

export default async function CreateCategoryPage() {
  const response = await getOrSeedCategories()
  const categories = response.data || []

  return (
    <FormWrapper
      title='Create Category'
      description='Define a new category to organize your finances.'
      oldPath='/category'
      oldPathTitle='Categories'
      pathTitle='Create'
    >
      <CreateCategoryForm availableParents={categories} />
    </FormWrapper>
  )
}
