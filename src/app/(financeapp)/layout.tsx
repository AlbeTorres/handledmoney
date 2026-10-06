import { AppHeader } from '@/app/(financeapp)/components/AppHeader'
import { DashboardFooter } from '@/app/(financeapp)/components/DashboardFooter'
import { AppSidebar } from '@/app/(financeapp)/components/Sidemenu'

import { SidebarProvider } from '@/components/ui/sidebar'

export default async function HandledMoneyLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main>
      <div className='flex h-screen overflow-hidden'>
        <SidebarProvider>
          <AppSidebar />
          <section className='flex-1 flex flex-col overflow-y-auto dark:bg-background-dark/50'>
            <AppHeader userName={'Usuario Ejemplo'} avatarUrl={null} />
            {children}
            <DashboardFooter />
          </section>
        </SidebarProvider>
      </div>
    </main>
  )
}

