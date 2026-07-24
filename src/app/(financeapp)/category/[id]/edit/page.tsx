import { getCategoryByIdAction } from '@/actions/category/get-category-by-id'
import { EditCategoryForm } from '@/components/EditCategoryForm'
import { FormWrapper } from '@/components/FormWrapper'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  const t = await getTranslations('handledmoney.category')

  const categoryResponse = await getCategoryByIdAction(id)

  if (!categoryResponse.success || !categoryResponse.data) {
    return (
      <FormWrapper
        title={t('edit.title')}
        description={t('edit.description')}
        oldPath='/category'
        oldPathTitle={t('breadcrumbs.categories')}
        pathTitle={t('edit.button')}
      >
        <div className='flex items-center justify-center h-full'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold mb-2'>{t('edit.not_found')}</h2>
            <p className='text-slate-500 mb-4'>{t('edit.not_found_description')}</p>
            <button
              onClick={() => redirect('/category')}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
            >
              {t('edit.go_back')}
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
  }

  return (
    <FormWrapper
      title={t('edit.title')}
      description={t('edit.description')}
      oldPath='/category'
      oldPathTitle={t('breadcrumbs.categories')}
      pathTitle={t('edit.button')}
    >
      <EditCategoryForm initialValues={formattedInitialValues} />
    </FormWrapper>
  )
}
