import { EditCategoryForm } from '@/components/EditCategoryForm'
import { FormWrapper } from '@/components/FormWrapper'
import { getCategoryByIdData } from '@/data-access/get-category-by-id'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  const t = await getTranslations('handledmoney.category')

  const categoryResponse = await getCategoryByIdData(id)

  if (!categoryResponse.success || !categoryResponse.data) {
    // There is no client-side redirect here: this is a server component, so the
    // go-back affordance must be a real link (event handlers don't run there).
    return (
      <FormWrapper
        title={t('edit.title')}
        description={t('edit.description')}
        oldPath='/category'
        oldPathTitle={t('breadcrumbs.categories')}
        pathTitle={t('edit.button')}
      >
        <div className='flex flex-col items-center justify-center gap-4 py-16 text-center'>
          <h2 className='text-2xl font-bold text-foreground'>{t('edit.not_found')}</h2>
          <p className='max-w-md text-sm text-muted-foreground'>
            {t('edit.not_found_description')}
          </p>
          <Link
            href='/category'
            className='rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors'
          >
            {t('edit.go_back')}
          </Link>
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
