import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const Hero = () => {
  return (
    <section className='container px-4 py-16 md:px-6 md:py-24'>
      <div className='mx-auto flex max-w-3xl flex-col items-start gap-6'>
        <div className='space-y-4'>
          <p className='label-caps text-primary'>Personal finance workspace</p>
          <h1 className='display-lg max-w-2xl'>A clear place to manage the money you track.</h1>
          <p className='body-lg max-w-2xl text-muted-foreground'>
            HandledMoney helps you organize accounts, record transactions, and build budgets in one
            focused workspace.
          </p>
        </div>
        <div className='flex flex-col gap-3 sm:flex-row'>
          <Button asChild>
            <Link href='/auth/new-account'>
              Create an account <ArrowRight aria-hidden='true' />
            </Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href='/auth/login'>Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Hero
