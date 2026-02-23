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
import { SidebarNavItem } from './SidebarNavItem'
import { SupportBox } from './SupportBox'

const NAV_ITEMS = [
  { href: '/dashboard', icon: FileChartColumn, label: 'Dashboard' },
  { href: '#', icon: WalletCards, label: 'Accounts' },
  { href: '#', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '#', icon: ChartColumnStacked, label: 'Reports' },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <div className='p-6 flex items-center gap-3'>
          <div className='size-10 bg-primary rounded-lg flex items-center justify-center text-white'>
            <LandmarkIcon aria-hidden='true' />
          </div>
          <div>
            <h1 className='text-lg font-bold tracking-tight'>FintechPro</h1>
            <p className='text-xs text-slate-500 dark:text-slate-400'>Premium Plan</p>
          </div>
        </div>

        <nav className='flex-1 px-4 py-4 flex flex-col gap-1'>
          {NAV_ITEMS.map(item => (
            <SidebarNavItem key={item.label} {...item} active={item.label === 'Dashboard'} />
          ))}
          <div className='my-4 border-t border-slate-200 dark:border-slate-800'></div>
          <SidebarNavItem href='#' icon={Settings} label='Settings' />
        </nav>

        <SupportBox />

        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
