import { twoFactorClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: 'http://localhost:3000',
  plugins: [twoFactorClient()],
  fetchOptions: {
    onError: async context => {
      const { response } = context
      if (response.status === 429) {
        const retryAfter = response.headers.get('X-Retry-After')
        console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`)
      }
    },
  },
})
