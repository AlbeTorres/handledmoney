import { Card, CardContent } from '@/components/ui/card'
import { PieChart, Shield, TrendingUp } from 'lucide-react'
import Image from 'next/image'

const Feature = () => {
  return (
    <section className='w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800'>
      <div className='container mx-auto px-4 md:px-6'>
        <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12'>
          Key Features
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          <Card>
            <CardContent className='flex flex-col items-center space-y-4 p-6'>
              <Image
                src='/placeholder.svg?height=200&width=200'
                alt='Smart Budgeting'
                width={200}
                height={200}
                className='rounded-full mb-4'
              />
              <PieChart className='h-12 w-12 text-primary' />
              <h3 className='text-2xl font-bold text-center'>Smart Budgeting</h3>
              <p className='text-center text-gray-500 dark:text-gray-400'>
                Automatically categorize your expenses and create personalized budgets.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex flex-col items-center space-y-4 p-6'>
              <Image
                src='/placeholder.svg?height=200&width=200'
                alt='Investment Tracking'
                width={200}
                height={200}
                className='rounded-full mb-4'
              />
              <TrendingUp className='h-12 w-12 text-primary' />
              <h3 className='text-2xl font-bold text-center'>Investment Tracking</h3>
              <p className='text-center text-gray-500 dark:text-gray-400'>
                Monitor your investments in real-time and get insights to grow your wealth.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex flex-col items-center space-y-4 p-6'>
              <Image
                src='/placeholder.svg?height=200&width=200'
                alt='Secure Banking'
                width={200}
                height={200}
                className='rounded-full mb-4'
              />
              <Shield className='h-12 w-12 text-primary' />
              <h3 className='text-2xl font-bold text-center'>Secure Banking</h3>
              <p className='text-center text-gray-500 dark:text-gray-400'>
                Bank-level encryption keeps your financial data safe and secure.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Feature
