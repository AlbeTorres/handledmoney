import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'

const ReLogin = () => {
  return (
    <section className='container py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground relative'>
      <Image
        src='/placeholder.svg?height=1080&width=1920&text=Finance+Background'
        alt='Finance Background'
        layout='fill'
        objectFit='cover'
        className='absolute inset-0 mix-blend-overlay opacity-10'
      />

      <div className='flex flex-col items-center gap-y-4 px-4 md:px-6 relative z-10 text-center'>
        <div className='space-y-2'>
          <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl'>
            Ready to Take Control?
          </h2>
          <p className='mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl'>
            Join thousands of users who have already transformed their financial lives with
            FinanceApp.
          </p>
        </div>
        <div className='w-full max-w-sm space-y-2'>
          <form className='flex space-x-2'>
            <Input
              className='max-w-lg flex-1 bg-primary-foreground text-primary'
              placeholder='Enter your email'
              type='email'
            />
            <Button
              className='bg-primary-foreground text-primary hover:bg-primary-foreground/90'
              type='submit'
            >
              Get Started
            </Button>
          </form>
          <p className='text-xs text-primary-foreground/90'>
            By signing up, you agree to our{' '}
            <Link className='underline underline-offset-2' href='#'>
              Terms & Conditions
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default ReLogin
