import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './components/sidemenu'

export default async function HandledMoneyLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className='bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-display'>
      <div className='flex h-screen overflow-hidden'>
        <SidebarProvider>
          {/* <!-- Sidebar Navigation --> */}

          <AppSidebar />

          <SidebarTrigger />
          {/* <!-- Main Content Area --> */}
          {children}
        </SidebarProvider>
      </div>
    </main>
  )
}
