import { Suspense } from 'react'
import { SearchInput } from './SearchInput'

export function AppHeader({ title }: { title: string }) {
  return (
    <header className='sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'>
      <div className='flex gap-4 flex-col sm:flex-row items-center justify-center sm:justify-between px-8 py-4 container mx-auto'>
        <h2 className='text-xl font-bold tracking-tight text-center sm:text-left w-full'>
          {title}
        </h2>
        <div className='w-60'>
          <Suspense fallback={<div className='h-10 w-48 bg-slate-200 animate-pulse rounded-md' />}>
            <SearchInput />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
