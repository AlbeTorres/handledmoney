import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './_components/sidemenu'
import { DashboardFooter } from './dashboard/_components/DashboardFooter'

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
          <SidebarTrigger />
          <section className='flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark/50'>
            {children}
            <DashboardFooter />
          </section>
        </SidebarProvider>
      </div>
    </main>
  )
}
