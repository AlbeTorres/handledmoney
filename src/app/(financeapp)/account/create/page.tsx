import { CreateAccountForm } from '@/components/CreateAccountForm'
import { FormWrapper } from '@/components/FormWrapper'
import { getTranslations } from 'next-intl/server'

export default async function CreateAccountPage() {
  const t = await getTranslations('handledmoney.account')
  return (
    <FormWrapper
      title={t('create.title')}
      description={t('create.description')}
      oldPath='/account'
      oldPathTitle={t('breadcrumbs.accounts')}
      pathTitle={t('breadcrumbs.create')}
    >
      <CreateAccountForm />
    </FormWrapper>
  )
}
