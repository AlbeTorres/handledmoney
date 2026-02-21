import { db } from '@/db' // your drizzle instance
import * as schema from '@/db/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { twoFactor } from "better-auth/plugins"

export const auth = betterAuth({
  appName: "HandledMoney", // provide your app name. It'll be used as an issuer.
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
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    twoFactor()
  ]
})
