/**
 * Failure-isolated envelope for the three shared dashboard sources. The page
 * wraps each repository promise exactly once; sections consume the envelope
 * and never retry, never fall back, and never fabricate values.
 *
 * Owner: src/lib/dashboard/source-result.ts (page/section boundary).
 */
export type SourceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: 'UNAVAILABLE' }

/**
 * Wraps one page-created source promise into a `SourceResult<T>` promise.
 * A rejection becomes `UNAVAILABLE`; the underlying promise is invoked exactly
 * once (the wrapper only attaches handlers, it never re-runs the source).
 */
export function toSourceResult<T>(source: Promise<T>): Promise<SourceResult<T>> {
  return source.then(
    (data): SourceResult<T> => ({ ok: true, data }),
    (): SourceResult<T> => ({ ok: false, code: 'UNAVAILABLE' }),
  )
}