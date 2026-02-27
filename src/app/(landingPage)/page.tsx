import Feature from '@/components/Feature'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ReLogin from '@/components/Relogin'
import Testimony from '@/components/Testimony'

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
