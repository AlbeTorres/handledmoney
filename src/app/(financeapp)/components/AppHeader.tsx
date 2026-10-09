'use client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { getPageTitle } from '@/lib/shell-nav'

interface AppHeaderProps {
  userName: string
  avatarUrl: string | null
}

export function AppHeader({ userName, avatarUrl }: AppHeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const initial = userName.trim().charAt(0).toUpperCase() || 'U'

  return (
    <header className='sticky top-0 z-10 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8'>
      <div className='flex min-w-0 items-center gap-3'>
        <SidebarTrigger className='size-11 shrink-0 sm:size-9' />
        <p className='truncate text-base font-semibold tracking-tight sm:text-lg'>{title}</p>
      </div>
      <div className='flex items-center gap-3'>
        {userName && (
          <span className='hidden text-sm text-muted-foreground md:inline'>{userName}</span>
        )}
        <div
          role='img'
          aria-label={userName || 'User avatar'}
          className='size-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted text-muted-foreground'
        >
          {avatarUrl ? (
            <Image
              alt=''
              className='h-full w-full object-cover'
              src={avatarUrl}
              width={36}
              height={36}
            />
          ) : (
            <span className='flex h-full w-full items-center justify-center text-sm font-semibold'>
              {initial}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
