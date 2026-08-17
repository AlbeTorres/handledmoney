import {
  formatCurrency,
  type CategoryRow,
  type GroupRow,
  type ViewMode,
} from '@/lib/finance-data'
import { cn } from '@/lib/utils'

const STATUS_BAR: Record<CategoryRow['status'], string> = {
  good: 'bg-success',
  warning: 'bg-warning',
  over: 'bg-danger',
  unplanned: 'bg-warning',
}

interface Props {
  groups: GroupRow[]
  viewMode: ViewMode
}

export function BudgetTable({ groups, viewMode }: Props) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-baseline justify-between border-b border-border p-5">
        <div>
          <h2 className="text-sm font-semibold">Estimado vs Real por categoría</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {viewMode === 'monthly'
              ? 'Detalle del mes seleccionado'
              : 'Acumulado anual vs presupuesto anual'}
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="p-5 text-sm text-muted-foreground">
          No hay categorías presupuestadas en este período
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
        {groups.map((group) => (
          <div key={group.id} className="p-3 sm:p-4">
            {/* Group header — dynamic name */}
            <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'size-2 rounded-full',
                    group.kind === 'income' ? 'bg-success' : 'bg-primary',
                  )}
                />
                <h3 className="text-sm font-semibold">{group.name}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {group.kind === 'income' ? 'Ingreso' : 'Gasto'}
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {formatCurrency(group.actual)} / {formatCurrency(group.planned)}
              </span>
            </div>

            {/* Category rows */}
            <ul className="mt-1 flex flex-col">
              {group.categories.map((cat) => (
                <li key={cat.id}>
                  <div className="flex flex-col gap-2 rounded-xl px-2 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm tabular-nums">
                          <span className="font-semibold">
                            {formatCurrency(cat.actual)}
                          </span>
                          <span className="text-muted-foreground">
                            {' / '}
                            {formatCurrency(cat.planned)}
                          </span>
                        </span>
                        <DiffBadge cat={cat} />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            STATUS_BAR[cat.status],
                          )}
                          style={{
                            width: `${Math.min(cat.pct, 1) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-medium text-muted-foreground tabular-nums">
                        {Math.round(cat.pct * 100)}%
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      )}
    </section>
  )
}

function DiffBadge({ cat }: { cat: CategoryRow }) {
  const positive = cat.diff >= 0
  const label =
    cat.kind === 'income'
      ? positive
        ? 'extra'
        : 'faltante'
      : positive
        ? 'disponible'
        : 'excedido'

  return (
    <span
      className={cn(
        'hidden min-w-24 items-center justify-end gap-1 font-mono text-xs font-semibold tabular-nums sm:flex',
        positive ? 'text-success' : 'text-danger',
      )}
    >
      {formatCurrency(cat.diff, { sign: true })}
      <span className="font-sans font-normal text-muted-foreground">{label}</span>
    </span>
  )
}
