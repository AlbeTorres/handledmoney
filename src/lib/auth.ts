import { sendEmail } from '@/actions/email/send-email'
import { db } from '@/db' // your drizzle instance
import * as schema from '@/db/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { twoFactor } from 'better-auth/plugins'

export const auth = betterAuth({
  appName: 'HandledMoney', // provide your app name. It'll be used as an issuer.
  database: drizzleAdapter(db, {
    provider: 'pg', // or "mysql", "sqlite"
    schema: schema,
  }),
  user: {
    additionalFields: {
      role: { type: 'string' },
      termsAcceptedAt: { type: 'date' },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url, token }, request) => {
        await sendEmail({
          email: newEmail, // o a user.email, según tu flujo de seguridad preferido
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
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendEmail({
        email: user.email,
        subject: 'Recupera tu contraseña',
        content: 'Haz clic en el link para resetear tu contraseña',
        firstName: user.name,
        url, // este url ya viene con el token incluido
      })
    },
    onPasswordReset: async ({ user }, request) => {
      // Invalidate ALL active sessions for this user after password reset
      console.log(`Password for user ${user.email} has been reset. All sessions invalidated.`)
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendEmail({
        email: user.email,
        subject: 'Verify your email address',
        content: `Click the link to verify your email`,
        firstName: user.name,
        url,
      })
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // },
  },
  rateLimit: {
    enabled: true,
    window: 60, // time window in seconds
    max: 100, // max requests in the window
    storage: 'database',
    modelName: 'rateLimit',
    customRules: {
      '/send-verification-email': {
        window: 60, // En un lapso de 60 segundos...
        max: 1, // ...solo permitimos 1 sola petición por IP.
      },
      '/sign-in/email': {
        window: 60, // Aumentamos la ventana a 60 segundos
        max: 5, // Permitimos 5 intentos antes de bloquear por IP
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 días para "remember me"
    updateAge: 60 * 60 * 24, // refresca cada 1 día de actividad
  },
  plugins: [twoFactor()],
})
