import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import Image from 'next/image'

const Testimony = () => {
  return (
    <section className='container  px-4 md:px-6 py-12 md:py-24 lg:py-32'>
      <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12'>
        What Our Users Say
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className='flex flex-col space-y-4 p-6'>
              <div className='flex items-center space-x-4'>
                <Image
                  src={`/placeholder.svg?height=60&width=60&text=User${i}`}
                  alt={`User ${i}`}
                  width={60}
                  height={60}
                  className='rounded-full'
                />
                <div>
                  <p className='font-semibold'>Happy User {i}</p>
                  <div className='flex items-center space-x-1'>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className='w-4 h-4 fill-primary' />
                    ))}
                  </div>
                </div>
              </div>
              <p className='text-gray-500 dark:text-gray-400'>
                {
                  "FinanceApp has completely transformed how I manage my money. It's intuitive, comprehensive, and actually makes personal finance enjoyable!"
                }
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default Testimony
