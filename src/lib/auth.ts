import { sendEmail } from '@/actions/email/send-email'
import { db } from '@/db' // Drizzle database instance
import * as schema from '@/db/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { twoFactor } from 'better-auth/plugins'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const auth = betterAuth({
  appName: 'HandledMoney', // Used as the authentication issuer.
  database: drizzleAdapter(db, {
    provider: 'pg', // Supported alternatives include "mysql" and "sqlite".
    schema: schema,
  }),
  user: {
    additionalFields: {
      role: { type: 'string' },
      termsAcceptedAt: { type: 'date' },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        await sendEmail({
          email: newEmail, // Use user.email instead for a different security flow.
          subject: 'Verify your new email address',
          content: `Click the link to verify your new email`,
          firstName: user.name,
          url,
        })

        await sendEmail({
          email: user.email,
          subject: 'Security alert: email change requested',
          content: `Someone requested to change your account email to ${newEmail}. If this wasn't you, secure your account immediately.`,
          url: '',
          firstName: user.name,
        })
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        email: user.email,
        subject: 'Recupera tu contraseña',
        content: 'Haz clic en el link para resetear tu contraseña',
        firstName: user.name,
        url, // The URL already includes the token.
      })
    },
    onPasswordReset: async ({ user }) => {
      // Invalidate ALL active sessions for this user after password reset
      console.log(`Password for user ${user.email} has been reset. All sessions invalidated.`)
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        email: user.email,
        subject: 'Verify your email address',
        content: `Click the link to verify your email`,
        firstName: user.name,
        url,
      })
    },
  },
  socialProviders: {
    ...(googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {}),
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // },
  },
  rateLimit: {
    enabled: true,
    window: 60, // Time window in seconds.
    max: 100, // Maximum requests in the window.
    storage: 'database',
    modelName: 'rateLimit',
    customRules: {
      '/send-verification-email': {
        window: 60, // One-minute window.
        max: 1, // One request per IP address.
      },
      '/sign-in/email': {
        window: 60, // One-minute window.
        max: 5, // Allow five attempts before blocking the IP address.
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // Thirty days for "remember me".
    updateAge: 60 * 60 * 24, // Refresh once per day of activity.
  },
  plugins: [twoFactor()],
})
