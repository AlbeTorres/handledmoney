import { getBankAccountByUserAction } from '@/actions/account/get-account'
import { getCategoriesByUserAction } from '@/actions/category/get-categories'
import { getTransactionByIdAction } from '@/actions/transaction/get-transaction'
import { EditTransactionForm } from '@/components/EditTransactionForm'
import { FormWrapper } from '@/components/FormWrapper'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface EditTransactionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const [accounts, categories] = await Promise.all([
    getBankAccountByUserAction(),
    getCategoriesByUserAction(),
  ])

  const { data: accountsData } = accounts
  const { data: categoriesData } = categories

  const { id } = await params

  const response = await getTransactionByIdAction(id)

  if (!response.success || !response.data) {
    //todo: show a toast with the error message user friendly not the error message from the database
    toast.error(response.message)
    return (
      <FormWrapper
        title='Edit Account'
        description='Update your account details.'
        oldPath='/account'
        oldPathTitle='Accounts'
        pathTitle='Edit'
      >
        <div className='flex items-center justify-center'>
          <p>Account not found</p>
          <Link href='/account'>Go back to accounts</Link>
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
      title='Edit Transaction'
      description='Set up your transaction details.'
      oldPath='/transaction'
      oldPathTitle='Transactions'
      pathTitle='Edit'
    >
      <EditTransactionForm
        accounts={accountsData}
        categories={categoriesData}
        initialValues={initialValues}
      />
    </FormWrapper>
  )
}
