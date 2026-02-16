import Feature from './components/feature'
import Footer from './components/footer'
import Header from './components/header'
import Hero from './components/hero'
import ReLogin from './components/relogin'
import Testimony from './components/testimony'

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
