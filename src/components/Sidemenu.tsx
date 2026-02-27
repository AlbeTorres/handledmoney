'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  ArrowLeftRight,
  ChartColumnStacked,
  FileChartColumn,
  LandmarkIcon,
  Settings,
  WalletCards,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { SidebarNavItem } from './SidebarNavItem'

const NAV_ITEMS = [
  { href: '/dashboard', icon: FileChartColumn, label: 'Dashboard' },
  { href: '/account', icon: WalletCards, label: 'Accounts' },
  { href: '/category', icon: ChartColumnStacked, label: 'Categories' },
  { href: '/transaction', icon: ArrowLeftRight, label: 'Transactions' },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' className='pointer-events-none' tooltip='FintechPro'>
              <div className='size-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0'>
                <LandmarkIcon aria-hidden='true' />
              </div>
              {/* This block is auto-hidden when collapsed */}
              <div>
                <h1 className='text-lg font-bold tracking-tight'>FintechPro</h1>
                <p className='text-xs text-slate-500 dark:text-slate-400'>Premium Plan</p>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className='gap-4'>
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                <SidebarNavItem
                  key={href}
                  href={href}
                  icon={Icon}
                  label={label}
                  active={pathname === href}
                />
              ))}
              <div className='my-4 border-t border-slate-200 dark:border-slate-800'></div>
              <SidebarNavItem
                href={'/settings'}
                icon={Settings}
                label={'Settings'}
                active={pathname === '/settings'}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SupportBox /> */}
    </Sidebar>
  )
}
