import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type * as schema from './schema'

/**
 * Drizzle database handle shared by the Node and Cloudflare adapters of
 * `@/db`. Both adapters expose the same `withDb` contract, so repositories
 * never need to know which runtime they are running on.
 */
export type Db = NodePgDatabase<typeof schema>

/** The transaction handle passed to `db.transaction` callbacks. */
export type DbTx = Parameters<Parameters<Db['transaction']>[0]>[0]

/** Callback shape accepted by `withDb`. */
export type WithDbCallback<T> = (db: Db) => Promise<T> | T
