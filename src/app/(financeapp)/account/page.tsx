import AccountAction from '@/components/AccountAction'
import { AccountGrid } from '@/components/AccountGrid'
import { EmptyState } from '@/components/EmptyState'
import { auth } from '@/lib/auth'
import { getBankAccountsByUser } from '@/repository/account'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

interface AccountPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
export default async function AccountPage({ searchParams }: AccountPageProps) {
  const t = await getTranslations('handledmoney.account')
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
          title={t('empty_state.title')}
          description={t('empty_state.description')}
          primaryActionText={t('empty_state.add_first_account')}
          onPrimaryActionHref='/account/create'
          showImportButton={true}
          importActionText={t('empty_state.import_data')}
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
