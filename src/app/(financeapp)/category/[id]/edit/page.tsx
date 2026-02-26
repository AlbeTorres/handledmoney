import { getOrSeedCategories } from '@/actions/category/get-categories'
import { getCategoryByIdAction } from '@/actions/category/get-category-by-id'
import { EditCategoryForm } from '@/components/categories/EditCategoryForm'
import { FormWrapper } from '@/components/FormWrapper'
import { redirect } from 'next/navigation'

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params

  const [categoryResponse, allCategoriesResponse] = await Promise.all([
    getCategoryByIdAction(id),
    getOrSeedCategories(),
  ])

  if (!categoryResponse.success || !categoryResponse.data) {
    redirect('/category')
  }

  return (
    <FormWrapper
      title='Edit Category'
      description='Update your category details or hierarchy.'
      oldPath='/category'
      oldPathTitle='Categories'
      pathTitle='Edit'
    >
      <EditCategoryForm
        initialData={categoryResponse.data}
        availableParents={allCategoriesResponse.data || []}
      />
    </FormWrapper>
  )
}
