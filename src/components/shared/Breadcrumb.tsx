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
      className='flex items-center gap-2 text-sm text-muted-foreground'
    >
      <Link
        className='hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded'
        href={oldPath}
      >
        {oldPathTitle}
      </Link>
      <ChevronRight aria-hidden='true' className='size-3.5' />
      <span className='text-foreground font-medium'>{pathTitle}</span>
    </nav>
  )
}