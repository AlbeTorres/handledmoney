'use client'

import { LucideEdit2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from './ui/button'

type PersonalInfomationSettingsProps = {
  user: {
    id: string
    name: string
    email: string
    twoFactorEnabled?: boolean | null
  }
}
export default function ProfileBadgeSettings({ user }: PersonalInfomationSettingsProps) {
  const t = useTranslations('handledmoney.settings.profile')

  return (
    <section className='relative mb-2 flex flex-col items-center gap-6 overflow-hidden rounded-xl border bg-card p-6 text-card-foreground md:flex-row'>
      <div className='relative'>
        <div className='flex size-28 items-center justify-center rounded-full border bg-muted text-2xl font-semibold text-muted-foreground'>
          <span aria-hidden>{user.name.trim().slice(0, 1).toUpperCase() || '?'}</span>
          <span className='sr-only'>{t('avatar_fallback', { name: user.name })}</span>
        </div>
        <Button
          className='absolute right-0 bottom-0 rounded-full'
          size='icon-sm'
          variant='secondary'
          disabled
          aria-label={t('avatar_unavailable')}
          title={t('avatar_unavailable')}
        >
          <LucideEdit2 size={20} />
        </Button>
      </div>
      <div className='space-y-1 text-center md:text-left'>
        <h1 className='text-2xl font-semibold'>{user.name}</h1>
        <p className='text-muted-foreground'>{user.email}</p>
        <p className='text-sm text-muted-foreground'>{t('avatar_unavailable')}</p>
        <div className='mt-4 flex gap-2 justify-center md:justify-start'>
          {user?.twoFactorEnabled ? (
            <span className='rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary'>
              {t('2fa_enabled')}
            </span>
          ) : (
            <span className='rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-sm text-destructive'>
              {t('2fa_disabled')}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
