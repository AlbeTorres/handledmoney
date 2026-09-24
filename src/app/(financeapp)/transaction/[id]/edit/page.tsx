import { EditTransactionForm } from '@/components/EditTransactionForm'
import { FormWrapper } from '@/components/FormWrapper'
import { getBankAccountByUserAction } from '@/data-access/get-account'
import { getCategoriesByUserData } from '@/data-access/get-categories'
import { getTransactionByIdAction } from '@/data-access/get-transaction'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

interface EditTransactionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const t = await getTranslations('handledmoney.transaction')

  const [accounts, categories] = await Promise.all([
    getBankAccountByUserAction(),
    getCategoriesByUserData(),
  ])

  const { data: accountsData } = accounts
  const { data: categoriesData } = categories

  const { id } = await params

  const response = await getTransactionByIdAction(id)

  if (!response.success || !response.data) {
    // The transaction does not exist (or belongs to another user). Render a
    // translated recovery state instead of a client-only toast error.
    return (
      <FormWrapper
        title={t('edit.title')}
        description={t('edit.description')}
        oldPath='/transaction'
        oldPathTitle={t('breadcrumbs.transactions')}
        pathTitle={t('breadcrumbs.edit')}
      >
        <div className='flex flex-col items-center justify-center gap-4 py-16 text-center'>
          <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>
            {t('edit.not_found')}
          </h2>
          <p className='max-w-md text-sm text-muted-foreground'>
            {t('edit.not_found_description')}
          </p>
          <Link
            href='/transaction'
            className='rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors'
          >
            {t('edit.go_back')}
          </Link>
        </div>
      </FormWrapper>
    )
  }

  const transaction = response.data

  const initialValues = {
    id: transaction.id,
    payee: transaction.payee,
    accountId: transaction.account.id,
    type: transaction.type,
    amount: Number(transaction.amount),
    date: transaction.date,
    notes: transaction.notes ?? '',
    categoryId: transaction.category?.id,
  }

  return (
    <FormWrapper
      title={t('edit.title')}
      description={t('edit.description')}
      oldPath='/transaction'
      oldPathTitle={t('breadcrumbs.transactions')}
      pathTitle={t('breadcrumbs.edit')}
    >
      <EditTransactionForm
        accounts={accountsData}
        categories={categoriesData}
        initialValues={initialValues}
      />
    </FormWrapper>
  )
}
