import AccountAction from '@/components/AccountAction'
import { AccountGrid } from '@/components/AccountGrid'
import { EmptyState } from '@/components/EmptyState'
import { auth } from '@/lib/auth'
import { getBankAccountsByUser } from '@/repository/account'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

interface AccountPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
export default async function AccountPage({ searchParams }: AccountPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/auth/login')
  }
  const accounts = (await getBankAccountsByUser(session.user.id)) || []

  const resolvedSearchParams = await searchParams

  const currency = resolvedSearchParams.currency
    ? (resolvedSearchParams.currency as string).split(',')
    : []
  const sort = (resolvedSearchParams.sort as string) || 'default'
  const search = (resolvedSearchParams.search as string) || ''

  if (!accounts || accounts.length === 0) {
    return (
      <div className='m-auto flex  flex-col justify-center items-center gap-4'>
        <EmptyState
          title='No accounts linked yet'
          description="To start tracking your financial health and gaining clarity on your spending, you'll need to link your bank accounts or manually create a tracking account."
          primaryActionText='Add Your First Account'
          onPrimaryActionHref='/account/create'
          showImportButton={true}
          importActionText='Import Data'
          onImportAction='/transaction/bulk'
        />
      </div>
    )
  }

  return (
    <div className='px-8 py-10 my-5 flex flex-col gap-y-10 container'>
      <AccountAction />
      <AccountGrid accounts={accounts} currency={currency} sort={sort} search={search} />
    </div>
  )
}
