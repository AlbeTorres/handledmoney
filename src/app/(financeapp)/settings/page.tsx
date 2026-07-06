import DangerZoneSettings from '@/components/DangerZoneSettings'
import NotificationChannelSettings from '@/components/NotificationChannelSettings'
import PersonalInfomationSettings from '@/components/PersonalInfomationSettings'
import PreferencesSettings from '@/components/PreferencesSettings'
import ProfileBadgeSettings from '@/components/ProfileBadgeSettings'
import TwoFASettings from '@/components/TwoFASettings'
import UpdatePasswordSettings from '@/components/UpdatePasswordSettings'

export default function Settings() {
  return (
    <div className='container mx-auto py-8 flex flex-col gap-5'>
      <ProfileBadgeSettings />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        <PersonalInfomationSettings />
        <UpdatePasswordSettings />
      </div>
      <TwoFASettings />
      <PreferencesSettings />
      <NotificationChannelSettings />
      <DangerZoneSettings />
    </div>
  )
}
