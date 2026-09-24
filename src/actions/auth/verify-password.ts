'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * Verifies the session user's current password without side effects.
 *
 * Used by flows that confirm a sensitive action (e.g. changing the email
 * address) with a password prompt. It must NEVER enable, disable, or otherwise
 * touch two-factor auth — that would silently change the account security
 * settings as a side effect of an unrelated action.
 */
export const verifyPasswordAction = async (
  password: string,
): Promise<{ success: boolean; status: number; message: string }> => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  try {
    // better-auth's /verify-password endpoint returns { status: true } on
    // success and throws APIError(BAD_REQUEST) on a wrong password.
    await auth.api.verifyPassword({ body: { password }, headers: await headers() })
    return { success: true, status: 200, message: 'Password verified' }
  } catch (error) {
    console.error('Password verification failed:', error)
    return { success: false, status: 400, message: 'Invalid password' }
  }
}
