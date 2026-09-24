/**
 * Test-only stub for the `server-only` package.
 *
 * `server-only` is a build-time guard that throws when imported from a client
 * bundle; in vitest we resolve it to this no-op module so repository/data-access
 * modules can be loaded directly by tests that exercise them.
 */
export {}
