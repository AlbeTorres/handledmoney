'use client'
import { Bell } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface AppHeaderProps {
  userName: string
  avatarUrl: string | null
}

const BELL_ICON = <Bell aria-hidden='true' />

const TITLE_MAP: Record<string, string> = {
  category: 'Category Overview',
  account: 'Accounts Overview',
  transactions: 'Transactions',
}

function getTitleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean) // ["category", "create"]
  const firstSegment = segments[0]

  if (!firstSegment) return 'Accounts Overview' // fallback para "/"

  return TITLE_MAP[firstSegment] ?? firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1)
}

export function AppHeader({ userName, avatarUrl }: AppHeaderProps) {
  const pathname = usePathname()
  const title = getTitleFromPathname(pathname)

  return (
    <header className='sticky shadow-sm top-0 z-10 flex items-center justify-between px-8 py-4 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'>
      <div className='flex items-center gap-8'>
        <h2 className='text-xl font-bold tracking-tight'>{title}</h2>
      </div>
      <div className='flex items-center gap-3'>
        <button
          className='p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative focus-visible:ring-2 focus-visible:ring-slate-400 outline-none'
          aria-label='Notifications'
        >
          {BELL_ICON}
          <span className='absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark'></span>
        </button>
        <div className='size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 relative'>
          {avatarUrl && (
            <Image
              alt={`${userName} Profile`}
              className='w-full h-full object-cover'
              src={avatarUrl}
              width={36}
              height={36}
              priority
            />
          )}
          {!avatarUrl && (
            <div className='w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400'>
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
