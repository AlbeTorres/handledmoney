'use server'

import { cookies } from 'next/headers'

const VALID_LOCALES = ['en', 'es'] as const

export const changeLocale = async (locale: string) => {
  if (!VALID_LOCALES.includes(locale as (typeof VALID_LOCALES)[number])) {
    return { success: false, message: 'Invalid locale' }
  }

  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
  })

  return { success: true, message: 'Locale updated' }
}
