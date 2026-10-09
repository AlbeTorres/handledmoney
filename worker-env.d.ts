/**
 * Cloudflare Worker bindings for this project.
 *
 * Two hand-written pieces live here on purpose instead of committing the
 * generated `worker-configuration.d.ts` (`wrangler types` output):
 *
 * 1. `CloudflareEnv` — the bindings this Worker reads at runtime. Add the
 *    real Hyperdrive config to `wrangler.jsonc` when it is provisioned; this
 *    declaration only describes the shape, never a credential or binding id.
 * OpenNext augments this global interface with its own internal bindings.
 *
 * Why not the generated file: its global runtime types redefine `Element`,
 * `Text`, `Comment`… and collide with `lib.dom` (workerd's `Element.remove()`
 * returns `Element`, the DOM's returns `void`), which makes DOM casts such as
 * `element as HTMLSelectElement` fail type checking. Re-running
 * `wrangler types` therefore writes to `worker-configuration.d.ts`, which is
 * gitignored *and* excluded in `tsconfig.json` so it can never re-break `tsc`.
 */
interface CloudflareEnv {
  /** Provisioned in the staging/production step; never commit a fake id. */
  HYPERDRIVE?: {
    connectionString: string
  }
}
