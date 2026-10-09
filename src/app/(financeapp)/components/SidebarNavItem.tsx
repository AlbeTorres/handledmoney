import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

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
        <Link href={href} aria-current={active ? 'page' : undefined}>
          <Icon className='size-5!' />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
