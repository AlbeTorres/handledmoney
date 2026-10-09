'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { Menu } from 'lucide-react'

export function AppHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className='sticky md:relative top-0 z-10 flex items-center justify-end gap-4 bg-background/90 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8'>
      <div className='flex items-center gap-3'>
        <button onClick={toggleSidebar} className='md:hidden'>
          <Menu />
        </button>
      </div>
    </header>
  )
}
