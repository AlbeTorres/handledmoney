import { CreateAccountBreadcrumb } from '../../_components/CreateAccountBreadcrumb'
import { CreateAccountForm } from '../../_components/CreateAccountForm'
import { CreateAccountHeader } from '../../_components/CreateAccountHeader'

export default function CreateAccountPage() {
  return (
    <main className='max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <CreateAccountBreadcrumb />
      <CreateAccountHeader
        title='Create New Bank Account'
        description='Set up your account details, type, and starting balance to begin tracking.'
      />
      <CreateAccountForm />
      <div className='mt-12 text-center'>
        <p className='text-sm text-slate-500 dark:text-slate-500'>
          Need help setting up your accounts?{' '}
          <a className='text-primary font-semibold hover:underline' href='#'>
            Read our guide
          </a>
        </p>
      </div>
    </main>
  )
}
