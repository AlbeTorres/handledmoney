import { AppHeader } from '@/app/(financeapp)/components/AppHeader'
import { DashboardFooter } from '@/app/(financeapp)/components/DashboardFooter'
import { AppSidebar } from '@/app/(financeapp)/components/Sidemenu'

import { SidebarProvider } from '@/components/ui/sidebar'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function HandledMoneyLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/auth/login')
  }

  const user = session.user

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className='flex min-h-dvh w-full flex-1 flex-col bg-background'>
        <AppHeader />
        <main className='flex-1'>{children}</main>
        <DashboardFooter />
      </div>
    </SidebarProvider>
  )
}
