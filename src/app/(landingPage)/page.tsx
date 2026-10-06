import Feature from '@/app/(landingPage)/components/Feature'
import Footer from '@/components/shared/Footer'
import Header from '@/components/shared/Header'
import Hero from '@/app/(landingPage)/components/Hero'
import ReLogin from '@/app/(landingPage)/components/Relogin'
import Testimony from '@/app/(landingPage)/components/Testimony'

export default function Home() {
  return (
    <>
      <Header />
      <main className='mx-auto w-full flex flex-col items-center'>
        <Hero />
        <Feature />
        <Testimony />
        <ReLogin />
      </main>
      <Footer />
    </>
  )
}

