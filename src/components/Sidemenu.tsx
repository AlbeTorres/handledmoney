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
  PiggyBank,
  Settings,
  WalletCards,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { isRouteActive } from '@/lib/shell-nav'
import { SidebarNavItem } from './SidebarNavItem'

const NAV_ITEMS = [
  { href: '/dashboard', icon: FileChartColumn, label: 'Dashboard' },
  { href: '/account', icon: WalletCards, label: 'Accounts' },
  { href: '/category', icon: ChartColumnStacked, label: 'Categories' },
  { href: '/transaction', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/budget', icon: PiggyBank, label: 'Budget' },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' className='pointer-events-none' tooltip='HandledMoney'>
              <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                <LandmarkIcon aria-hidden='true' />
              </div>
              {/* This block is auto-hidden when collapsed */}
              <div>
                <h1 className='text-lg font-bold tracking-tight text-sidebar-foreground'>
                  HandledMoney
                </h1>
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
                  active={isRouteActive(pathname, href)}
                />
              ))}
              <div className='my-4 border-t border-sidebar-border'></div>
              <SidebarNavItem
                href={'/settings'}
                icon={Settings}
                label={'Settings'}
                active={isRouteActive(pathname, '/settings')}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SupportBox /> */}
    </Sidebar>
  )
}
