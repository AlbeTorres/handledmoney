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
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
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
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`)
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
  },
  plugins: [twoFactor()],
})
