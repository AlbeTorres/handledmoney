import DangerZoneSettings from '@/components/DangerZoneSettings'
import NotificationChannelSettings from '@/components/NotificationChannelSettings'
import PersonalInfomationSettings from '@/components/PersonalInfomationSettings'
import PreferencesSettings from '@/components/PreferencesSettings'
import ProfileBadgeSettings from '@/components/ProfileBadgeSettings'
import TwoFASettings from '@/components/TwoFASettings'
import UpdatePasswordSettings from '@/components/UpdatePasswordSettings'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Settings() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/auth/login')
  }

  const user = session.user

  return (
    <div className='container mx-auto py-8 flex flex-col gap-5'>
      <ProfileBadgeSettings user={user} />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        <PersonalInfomationSettings user={user} />
        <UpdatePasswordSettings />
      </div>
      <TwoFASettings />
      <PreferencesSettings />
      <NotificationChannelSettings />
      <DangerZoneSettings />
    </div>
  )
}
