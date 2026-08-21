import { CreateTransactionForm } from '@/components/CreateTransactionForm'
import { FormWrapper } from '@/components/FormWrapper'
import { getBankAccountByUserAction } from '@/data-access/get-account'
import { getCategoriesByUserAction } from '@/data-access/get-categories'

export default async function CreateTransactionPage() {
  const [account, categories] = await Promise.all([
    getBankAccountByUserAction(),
    getCategoriesByUserAction(),
  ])

  const { data: accountsData } = account
  const { data: categoriesData } = categories

  return (
    <FormWrapper
      title='Create Transaction'
      description='Set up your transaction details.'
      oldPath='/transaction'
      oldPathTitle='Transactions'
      pathTitle='Create'
    >
      <CreateTransactionForm accounts={accountsData} categories={categoriesData} />
    </FormWrapper>
  )
}
