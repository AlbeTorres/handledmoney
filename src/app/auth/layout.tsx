import authImg from '@/assets/auth.jpg'
import Image from 'next/image'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex justify-center gap-12 min-h-screen h-screen items-center'>
      <figure className='relative hidden md:block min-h-96 max-w-lg h-4/6 w-full'>
        <Image
          src={authImg}
          alt='Personal finance dashboard'
          layout='fill'
          objectFit='cover'
          className='rounded-lg shadow-md'
        />
      </figure>
      {children}
    </div>
  )
}
