import Feature from '@/components/Feature'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Feature />
      </main>
      <Footer />
    </>
  )
}
