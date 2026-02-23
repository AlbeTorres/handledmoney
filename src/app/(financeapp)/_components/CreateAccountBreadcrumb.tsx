import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function CreateAccountBreadcrumb() {
  return (
    <nav
      aria-label='Breadcrumb'
      className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8'
    >
      <Link
        className='hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded'
        href='/account'
      >
        Accounts
      </Link>
      <ChevronRight aria-hidden='true' className='size-3.5' />
      <span className='text-slate-900 dark:text-slate-100 font-medium'>Create New Account</span>
    </nav>
  )
}
