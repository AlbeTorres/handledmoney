import AccountAction from './components/AccountAction'
import { AccountGrid } from './components/AccountGrid'
import { EmptyState } from '@/components/shared/EmptyState'
import { auth } from '@/lib/auth'
import { getBankAccountsByUser } from '@/repository/account'
import { getTranslations } from 'next-intl/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

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
      <div className='container flex w-full flex-col items-center gap-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10'>
        <div className='flex w-full flex-col gap-1'>
          <h1 className='text-2xl font-bold tracking-tight'>{t('breadcrumbs.accounts')}</h1>
        </div>
        <EmptyState
          title={t('empty_state.title')}
          description={t('empty_state.description')}
          primaryActionText={t('empty_state.add_first_account')}
          onPrimaryActionHref='/account/create'
          showImportButton={false}
          importActionText={t('empty_state.import_data')}
          onImportAction='/transaction/bulk'
        />
      </div>
    )
  }

  return (
    <div className='container flex w-full flex-col gap-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold tracking-tight'>{t('breadcrumbs.accounts')}</h1>
      </div>
      <AccountAction />
      <AccountGrid accounts={accounts} currency={currency} sort={sort} search={search} />
    </div>
  )
}
