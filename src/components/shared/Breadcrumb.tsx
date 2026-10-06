import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

type AccountBreadcrumbProps = {
  pathTitle: string
  oldPath: string
  oldPathTitle: string
}

export function Breadcrumb({ pathTitle, oldPath, oldPathTitle }: AccountBreadcrumbProps) {
  return (
    <nav
      aria-label='Breadcrumb'
      className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8'
    >
      <Link
        className='hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded'
        href={oldPath}
      >
        {oldPathTitle}
      </Link>
      <ChevronRight aria-hidden='true' className='size-3.5' />
      <span className='text-slate-900 dark:text-slate-100 font-medium'>{pathTitle}</span>
    </nav>
  )
}
