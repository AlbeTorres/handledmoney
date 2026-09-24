'use client'
import { Bell } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

import { getPageTitle } from '@/lib/shell-nav'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface AppHeaderProps {
  userName: string
  avatarUrl: string | null
}

export function AppHeader({ userName, avatarUrl }: AppHeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className='sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8'>
      <div className='flex min-w-0 items-center gap-2 sm:gap-3'>
        <SidebarTrigger aria-label='Open navigation menu' className='size-11 md:size-9' />
        <h2 className='truncate text-lg font-bold tracking-tight sm:text-xl'>{title}</h2>
      </div>
      <div className='flex items-center gap-2 sm:gap-3'>
        <button
          type='button'
          aria-label='Notifications'
          className='relative flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring md:size-10'
        >
          <Bell aria-hidden='true' className='size-5' />
          <span className='absolute top-2.5 right-2.5 size-2 rounded-full bg-destructive ring-2 ring-background'></span>
        </button>
        <div className='relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground md:size-10'>
          {avatarUrl && (
            <Image
              alt={`${userName} profile`}
              className='size-full object-cover'
              src={avatarUrl}
              width={40}
              height={40}
              priority
            />
          )}
          {!avatarUrl && (
            <span className='text-sm font-semibold'>{userName.charAt(0).toUpperCase()}</span>
          )}
        </div>
      </div>
    </header>
  )
}
