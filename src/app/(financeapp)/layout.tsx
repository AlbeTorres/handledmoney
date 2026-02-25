import { DashboardFooter } from '@/components/DashboardFooter'
import { AppSidebar } from '@/components/Sidemenu'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default async function HandledMoneyLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className='bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-display'>
      <div className='flex h-screen overflow-hidden'>
        <SidebarProvider>
          <AppSidebar />
          <section className='flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark/50'>
            <SidebarTrigger className='absolute z-40' />
            {children}
            <DashboardFooter />
          </section>
        </SidebarProvider>
      </div>
    </main>
  )
}
