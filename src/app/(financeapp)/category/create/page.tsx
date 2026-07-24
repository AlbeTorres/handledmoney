import { CreateCategoryForm } from '@/components/CreateCategoryForm'
import { FormWrapper } from '@/components/FormWrapper'
import { getTranslations } from 'next-intl/server'

export default async function CreateCategoryPage() {
  const t = await getTranslations('handledmoney.category')

  return (
    <FormWrapper
      title={t('create.title')}
      description={t('create.description')}
      oldPath='/category'
      oldPathTitle={t('breadcrumbs.categories')}
      pathTitle={t('create.button')}
    >
      <CreateCategoryForm />
    </FormWrapper>
  )
}
