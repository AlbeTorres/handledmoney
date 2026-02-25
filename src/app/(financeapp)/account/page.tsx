import { AccountFilters } from '@/components/AccountFilters'
import { AccountGrid } from '@/components/AccountGrid'
import { AccountHeader } from '@/components/AccountHeader'
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

  const userName = session.user?.name || 'User'
  const avatarUrl = session.user?.image || null

  return (
    <>
      <AccountHeader userName={userName} avatarUrl={avatarUrl} />
      <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
        <Suspense fallback={<div className='h-10 w-full bg-slate-200 animate-pulse rounded-lg' />}>
          <AccountFilters />
        </Suspense>
        <AccountGrid userId={session.user.id} tab={tab} />
      </div>
    </>
  )
}
