import { getAccountById } from '@/actions/account/get-account'
import { EditAccountForm } from '@/components/EditAccountForm'
import { FormWrapper } from '@/components/FormWrapper'
import toast from 'react-hot-toast'

interface EditAccountPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const { id } = await params

  const response = await getAccountById(id)

  if (!response.success) {
    toast.error(response.message)
    return
  }

  if (!response.data) {
    toast.error('Account not found')
    return
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
