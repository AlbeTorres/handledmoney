export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className='container flex min-h-screen items-center justify-center px-4 py-10 md:px-6'>
      {children}
    </main>
  )
}
