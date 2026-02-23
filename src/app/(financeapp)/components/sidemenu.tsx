import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar'
import {
  ArrowLeftRight,
  ChartColumnStacked,
  FileChartColumn,
  LandmarkIcon,
  Settings,
  WalletCards,
} from 'lucide-react'

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <div className='p-6 flex items-center gap-3'>
          <div className='size-10 bg-primary rounded-lg flex items-center justify-center text-white'>
            <LandmarkIcon />
          </div>
          <div>
            <h1 className='text-lg font-bold tracking-tight'>FintechPro</h1>
            <p className='text-xs text-slate-500 dark:text-slate-400'>Premium Plan</p>
          </div>
        </div>

        <nav className='flex-1 px-4 py-4 flex flex-col gap-1'>
          <a
            className='flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            href='#'
          >
            <FileChartColumn />
            <span className='text-sm font-medium'>Dashboard</span>
          </a>
          <a
            className='flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            href='#'
          >
            <WalletCards />
            <span className='text-sm font-medium'>Accounts</span>
          </a>
          <a
            className='flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            href='#'
          >
            <ArrowLeftRight />
            <span className='text-sm font-medium'>Transactions</span>
          </a>
          <a
            className='flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            href='#'
          >
            <ChartColumnStacked />
            <span className='text-sm font-medium'>Reports</span>
          </a>
          <div className='my-4 border-t border-slate-200 dark:border-slate-800'></div>
          <a
            className='flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            href='#'
          >
            <Settings />
            <span className='text-sm font-medium'>Settings</span>
          </a>
        </nav>
        <div className='p-4'>
          <div className='bg-primary/10 rounded-xl p-4 border border-primary/20'>
            <p className='text-xs font-semibold text-primary uppercase tracking-wider mb-2'>
              Support
            </p>
            <p className='text-xs text-slate-600 dark:text-slate-400 mb-3'>
              Need help with your accounts?
            </p>
            <button className='w-full py-2 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-opacity'>
              Contact Us
            </button>
          </div>
        </div>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
