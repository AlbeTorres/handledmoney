import SenderButton from '@/components/email/sender-button'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect('/auth/login')
  }
  return (
    <div>
      <h1>Dashboard</h1>
      <SenderButton />
    </div>
  )
}
