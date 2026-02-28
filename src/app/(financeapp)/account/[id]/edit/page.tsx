import { getBankAccountByIdAction } from '@/actions/account/get-account'
import { EditAccountForm } from '@/components/EditAccountForm'
import { FormWrapper } from '@/components/FormWrapper'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface EditAccountPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const { id } = await params

  const response = await getBankAccountByIdAction(id)

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

  const account = response.data

  const initialValues = {
    id: account.id,
    name: account.name ?? '',
    bank: account.bank ?? '',
    type: account.type as any, // enum casting
    currency: account.currency as any, // enum casting
    icon: account.icon ?? 'account_balance',
    color: account.color ?? '137FEC',
  }

  return (
    <FormWrapper
      title='Edit Account'
      description='Update your account details.'
      oldPath='/account'
      oldPathTitle='Accounts'
      pathTitle='Edit'
    >
      <EditAccountForm initialValues={initialValues} />
    </FormWrapper>
  )
}
