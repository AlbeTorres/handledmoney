import Link from 'next/link'

const Footer = () => {
  return (
    <footer className='border-t'>
      <div className='container flex flex-col items-center gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row md:px-6'>
        <p>HandledMoney</p>
        <nav className='flex gap-4 sm:ml-auto' aria-label='Legal navigation'>
          <Link
            className='rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            href='/terms'
          >
            Terms
          </Link>
          <Link
            className='rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            href='/privacy'
          >
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
