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
    <Link
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none ${
        active
          ? 'bg-primary/10 text-primary font-bold'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
      href={href}
    >
      <Icon size={18} aria-hidden='true' />
      <span className='text-sm font-medium'>{label}</span>
    </Link>
  )
}
