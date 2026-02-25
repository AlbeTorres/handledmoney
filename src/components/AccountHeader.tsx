import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { AccountSearchInput } from './AccountSearchInput'

interface DashboardHeaderProps {
  userName: string
  avatarUrl: string | null
}

const PLUS_ICON = <PlusIcon aria-hidden='true' />

export function AccountHeader({ userName, avatarUrl }: DashboardHeaderProps) {
  return (
    <header className='sticky top-0 z-10  bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'>
      <div className='flex items-center justify-between px-8 py-4 container mx-auto'>
        <div className='flex items-center gap-8'>
          <h2 className='text-xl font-bold tracking-tight w-full'>Accounts Overview</h2>

          <Suspense fallback={<div className='h-10 w-48 bg-slate-200 animate-pulse rounded-md' />}>
            <AccountSearchInput />
          </Suspense>
        </div>
        <div className='flex items-center gap-3'>
          <Link
            href='/account/create'
            className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none'
          >
            {PLUS_ICON}
            <span>Add Account</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

// <button
//         className='p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative focus-visible:ring-2 focus-visible:ring-slate-400 outline-none'
//         aria-label='Notifications'
//       >
//         {BELL_ICON}
//         <span className='absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark'></span>
//       </button>
//       <div className='size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 relative'>
//         {avatarUrl && (
//           <Image
//             alt={`${userName} Profile`}
//             className='w-full h-full object-cover'
//             src={avatarUrl}
//             width={36}
//             height={36}
//             priority
//           />
//         )}
//         {!avatarUrl && (
//           <div className='w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400'>
//             {userName.charAt(0).toUpperCase()}
//           </div>
//         )}
//       </div>
