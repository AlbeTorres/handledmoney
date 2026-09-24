import { Landmark } from 'lucide-react'
import Link from 'next/link'

const Header = () => {
  return (
    <header className='border-b bg-background'>
      <div className='container flex min-h-16 items-center justify-between px-4 md:px-6'>
        <Link
          className='flex items-center gap-2 rounded-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          href='/'
          aria-label='HandledMoney home'
        >
          <Landmark className='size-5 text-primary' aria-hidden='true' />
          <span>HandledMoney</span>
        </Link>
        <nav className='flex items-center gap-4 text-sm font-medium' aria-label='Public navigation'>
          <Link
            className='rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            href='/auth/login'
          >
            Sign in
          </Link>
          <Link
            className='rounded-sm bg-primary px-3 py-2 text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            href='/auth/new-account'
          >
            Create account
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
