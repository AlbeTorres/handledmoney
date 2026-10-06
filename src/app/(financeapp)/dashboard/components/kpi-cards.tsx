import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Scale,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { formatCurrency } from '@/lib/dashboard/format'
import type { DashboardKpis } from '@/lib/dashboard/kpis'
import { cn } from '@/lib/utils'

interface Props {
  kpis: DashboardKpis
}

function pct(actual: number, planned: number): number {
  return planned > 0 ? Math.round((actual / planned) * 100) : 0
}

export function KpiCards({ kpis }: Props) {
  const incomePct = pct(kpis.incomeActual, kpis.incomePlanned)
  const expensePct = pct(kpis.expenseActual, kpis.expensePlanned)

  const cards: {
    label: string
    icon: LucideIcon
    value: string
    tone: 'success' | 'danger' | 'neutral'
    footer: React.ReactNode
  }[] = [
    {
      label: 'Ingreso Real',
      icon: TrendingUp,
      value: formatCurrency(kpis.incomeActual),
      tone: 'success',
      footer: (
        <Delta
          good={kpis.incomeActual >= kpis.incomePlanned}
          text={`${incomePct}% de ${formatCurrency(kpis.incomePlanned)} estimado`}
        />
      ),
    },
    {
      label: 'Gasto Real',
      icon: TrendingDown,
      value: formatCurrency(kpis.expenseActual),
      tone: kpis.expenseActual > kpis.expensePlanned ? 'danger' : 'neutral',
      footer: (
        <Delta
          good={kpis.expenseActual <= kpis.expensePlanned}
          text={`${expensePct}% de ${formatCurrency(kpis.expensePlanned)} presupuestado`}
        />
      ),
    },
    {
      label: 'Balance Neto',
      icon: Scale,
      value: formatCurrency(kpis.netActual),
      tone: kpis.netActual >= 0 ? 'success' : 'danger',
      footer: (
        <span className="text-xs text-muted-foreground">
          Estimado {formatCurrency(kpis.netPlanned)}
        </span>
      ),
    },
    {
      label: 'Disponible para presupuestar',
      icon: PiggyBank,
      value: formatCurrency(kpis.available),
      tone: kpis.available >= 0 ? 'success' : 'danger',
      footer: (
        <span className="text-xs text-muted-foreground">
          {kpis.available >= 0
            ? 'Dinero sin asignar'
            : 'Presupuesto sobreasignado'}
        </span>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground text-pretty">
              {c.label}
            </span>
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-lg',
                c.tone === 'success' && 'bg-success/12 text-success',
                c.tone === 'danger' && 'bg-danger/12 text-danger',
                c.tone === 'neutral' && 'bg-muted text-muted-foreground',
              )}
            >
              <c.icon className="size-4" />
            </span>
          </div>
          <p
            className={cn(
              'mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight',
              c.tone === 'success' && 'text-success',
              c.tone === 'danger' && 'text-danger',
              c.tone === 'neutral' && 'text-foreground',
            )}
          >
            {c.value}
          </p>
          <div className="mt-2">{c.footer}</div>
        </div>
      ))}
    </div>
  )
}

function Delta({ good, text }: { good: boolean; text: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        good ? 'text-success' : 'text-danger',
      )}
    >
      {good ? (
        <ArrowUpRight className="size-3.5" />
      ) : (
        <ArrowDownRight className="size-3.5" />
      )}
      <span className="text-muted-foreground">{text}</span>
    </span>
  )
}
