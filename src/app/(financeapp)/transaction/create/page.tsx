import { CreateTransactionForm } from '@/components/CreateTransactionForm'
import { FormWrapper } from '@/components/FormWrapper'
import { getBankAccountByUserAction } from '@/data-access/get-account'
import { getCategoriesByUserData } from '@/data-access/get-categories'
import { getTranslations } from 'next-intl/server'

export default async function CreateTransactionPage() {
  const t = await getTranslations('handledmoney.transaction')

  const [account, categories] = await Promise.all([
    getBankAccountByUserAction(),
    getCategoriesByUserData(),
  ])

  const { data: accountsData } = account
  const { data: categoriesData } = categories

  return (
    <FormWrapper
      title={t('create.title')}
      description={t('create.description')}
      oldPath='/transaction'
      oldPathTitle={t('breadcrumbs.transactions')}
      pathTitle={t('breadcrumbs.create')}
    >
      <CreateTransactionForm accounts={accountsData} categories={categoriesData} />
    </FormWrapper>
  )
}
