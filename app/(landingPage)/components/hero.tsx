import heroImage from '@/assets/hero.png'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const Hero = () => {
  return (
    <section className='container px-4 md:px-6 py-12 md:py-24 lg:py-32 xl:py-48 '>
      <div className='flex flex-col items-center space-y-4 text-center'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none'>
            Take Control of Your Finances
          </h1>
          <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400'>
            Simplify your financial life with our all-in-one personal finance app. Budget, save, and
            invest smarter.
          </p>
        </div>
        <figure className='mt-8 mb-10 relative w-full max-w-3xl aspect-video mx-auto'>
          <Image
            src={heroImage}
            alt='Personal finance dashboard'
            layout='fill'
            objectFit='cover'
            className='rounded-xl shadow-2xl'
          />
        </figure>
        <div className='space-x-4'>
          <Button>Get Started</Button>
          <Button variant='outline'>Learn More</Button>
        </div>
      </div>
    </section>
  )
}

export default Hero
