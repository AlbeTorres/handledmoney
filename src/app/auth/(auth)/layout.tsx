import authImg from '@/assets/auth.jpg'
import Image from 'next/image'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <figure className='relative hidden min-h-96 w-full max-w-lg md:block'>
        <Image src={authImg} alt='Personal finance dashboard' fill className='object-cover' />
      </figure>
      {children}
    </>
  )
}
