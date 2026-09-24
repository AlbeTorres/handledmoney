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
    <div className='container mx-auto flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8'>
      <ProfileBadgeSettings user={user} />
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
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
