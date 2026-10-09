import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import * as schema from './schema'
import type { Db, WithDbCallback } from './types'

/**
 * Cloudflare Workers adapter, used only by the vinext build (the `@/db`
 * import is aliased to this module by `vite.config.ts`).
 *
 * Hyperdrive keeps the pooled connection to the origin database; the `pg`
 * client itself must be created per operation because node-postgres clients
 * cannot be reconnected after they close, and reusing one across requests
 * causes "Connection terminated" failures. Every call therefore connects a
 * fresh client and releases it in `finally`, so no Worker invocation can
 * outlive its database handle.
 */
export async function withHyperdriveDb<T>(
  connectionString: string | undefined,
  fn: WithDbCallback<T>,
): Promise<T> {
  if (!connectionString) {
    throw new Error(
      'HYPERDRIVE binding is not configured for this Worker. Provision Hyperdrive and add the binding to wrangler.jsonc.',
    )
  }

  const client = new Client({ connectionString })
  await client.connect()
  try {
    return await fn(drizzle({ client, schema }) as unknown as Db)
  } finally {
    try {
      await client.end()
    } catch {
      // The connection may already be closed by a failed query; Hyperdrive
      // reclaims the edge connection when the request ends regardless.
    }
  }
}
