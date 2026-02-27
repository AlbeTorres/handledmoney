import { AccountFilters } from '@/components/AccountFilters'
import { AccountGrid } from '@/components/AccountGrid'
import { AppHeader } from '@/components/AppHeader'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

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

  const resolvedSearchParams = await searchParams
  const tab = (resolvedSearchParams.tab as string) || 'default'
  const sort = (resolvedSearchParams.sort as string) || 'default'
  const search = (resolvedSearchParams.search as string) || ''

  return (
    <>
      <AppHeader title='Accounts Overview' />
      <div className='p-8 space-y-8 container'>
        <Suspense fallback={<div className='h-10 w-full bg-slate-200 animate-pulse rounded-lg' />}>
          <AccountFilters />
        </Suspense>
        <AccountGrid userId={session.user.id} tab={tab} sort={sort} search={search} />
      </div>
    </>
  )
}
