import { CreateAccountForm } from '@/components/CreateAccountForm'
import { FormWrapper } from '@/components/FormWrapper'

export default function CreateAccountPage() {
  return (
    <FormWrapper
      title='Create Account'
      description='Set up your account details.'
      oldPath='/account'
      oldPathTitle='Accounts'
      pathTitle='Create'
    >
      <CreateAccountForm />
    </FormWrapper>
  )
}
