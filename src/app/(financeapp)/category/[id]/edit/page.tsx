import { getCategoryByIdAction } from '@/actions/category/get-category-by-id'
import { EditCategoryForm } from '@/components/categories/EditCategoryForm'
import { FormWrapper } from '@/components/FormWrapper'
import { redirect } from 'next/navigation'

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params

  const categoryResponse = await getCategoryByIdAction(id)

  if (!categoryResponse.success || !categoryResponse.data) {
    return (
      <FormWrapper
        title='Edit Category'
        description='Update your category details or hierarchy.'
        oldPath='/category'
        oldPathTitle='Categories'
        pathTitle='Edit'
      >
        <div className='flex items-center justify-center h-full'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold mb-2'>Category not found</h2>
            <p className='text-slate-500 mb-4'>
              The category you are trying to edit does not exist.
            </p>
            <button
              onClick={() => redirect('/category')}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
            >
              Go back to categories
            </button>
          </div>
        </div>
      </FormWrapper>
    )
  }
  const data = categoryResponse.data

  const formattedInitialValues = {
    id: data.id,
    name: data.name,
    icon: data.icon ?? '', // Fallback to empty string if null
    color: data.color ?? '000000', // Fallback to a default color if null
    type: data.type,
    parentId: data.parentId,
  }

  return (
    <FormWrapper
      title='Edit Category'
      description='Update your category details or hierarchy.'
      oldPath='/category'
      oldPathTitle='Categories'
      pathTitle='Edit'
    >
      <EditCategoryForm initialValues={formattedInitialValues} />
    </FormWrapper>
  )
}
