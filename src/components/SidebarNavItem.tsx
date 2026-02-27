import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'

interface SidebarNavItemProps {
  href: string
  icon: LucideIcon
  label: string
  active?: boolean
}

export function SidebarNavItem({ href, icon: Icon, label, active }: SidebarNavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton className='h-10' asChild isActive={active} tooltip={label}>
        <Link href={href}>
          <Icon className='size-5!' />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
