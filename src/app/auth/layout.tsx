export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex justify-center'>
      <div className='w-full min-h-screen flex justify-center items-center'>{children}</div>
    </div>
  )
}
