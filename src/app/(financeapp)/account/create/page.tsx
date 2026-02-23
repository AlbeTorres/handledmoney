import { CreateAccountBreadcrumb } from '@/components/CreateAccountBreadcrumb'
import { CreateAccountForm } from '@/components/CreateAccountForm'
import { CreateAccountHeader } from '@/components/CreateAccountHeader'

export default function CreateAccountPage() {
  return (
    <main className='max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <CreateAccountBreadcrumb />
      <CreateAccountHeader
        title='Create New Bank Account'
        description='Set up your account details, type, and starting balance to begin tracking.'
      />
      <CreateAccountForm />
    </main>
  )
}
