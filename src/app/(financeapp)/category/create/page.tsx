import { CreateCategoryForm } from '@/components/CreateCategoryForm'
import { FormWrapper } from '@/components/FormWrapper'

export default async function CreateCategoryPage() {
  return (
    <FormWrapper
      title='Create Category'
      description='Define a new category to organize your finances.'
      oldPath='/category'
      oldPathTitle='Categories'
      pathTitle='Create'
    >
      <CreateCategoryForm />
    </FormWrapper>
  )
}
