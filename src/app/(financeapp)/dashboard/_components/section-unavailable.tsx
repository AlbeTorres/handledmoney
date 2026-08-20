/**
 * Shared safe unavailable state for dashboard server sections. When a
 * section's source resolves to `UNAVAILABLE` the section renders this shell:
 * a non-sensitive, retryable alert with no fabricated values and no extra
 * queries.
 */
export function SectionUnavailable() {
  return (
    <section className='rounded-xl border border-border bg-card p-5 shadow-sm'>
      <div role='alert' className='text-sm text-muted-foreground'>
        No se pudieron cargar los datos de esta sección. Intenta actualizar la página.
      </div>
    </section>
  )
}