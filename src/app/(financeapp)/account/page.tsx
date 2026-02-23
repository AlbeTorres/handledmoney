import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AccountFilters } from '../_components/AccountFilters'
import { AccountGrid } from '../_components/AccountGrid'
import { DashboardHeader } from '../_components/DashboardHeader'

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/auth/login')
  }

  // Assuming session.user has name and image. Hardcoded fallback as in original.
  const userName = session.user?.name || 'User'
  const avatarUrl = session.user?.image || null

  return (
    <>
      <DashboardHeader userName={userName} avatarUrl={avatarUrl} />
      <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
        <Suspense fallback={<div className='h-10 w-full bg-slate-200 animate-pulse rounded-lg' />}>
          <AccountFilters />
        </Suspense>
        <AccountGrid />
      </div>
    </>
  )
}
