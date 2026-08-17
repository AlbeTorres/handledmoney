import { Lightbulb } from 'lucide-react'
import { formatCurrency, type GroupRow } from '@/lib/finance-data'

interface Props {
  groups: GroupRow[]
}

/**
 * Derives a real, data-driven insight from the current period's category rows.
 * Nothing here is hardcoded — the message adapts to whatever the numbers say.
 */
export function InsightCard({ groups }: Props) {
  const categories = groups
    .filter((g) => g.kind === 'expense')
    .flatMap((g) => g.categories)

  let message = 'Aún no hay suficientes movimientos para generar una recomendación.'

  if (categories.length > 0) {
    const overspent = [...categories]
      .filter((c) => c.diff < 0)
      .sort((a, b) => a.diff - b.diff)[0]
    const bestSaver = [...categories]
      .filter((c) => c.diff > 0 && c.actual > 0)
      .sort((a, b) => b.diff - a.diff)[0]

    if (overspent) {
      message = `Te excediste ${formatCurrency(
        Math.abs(overspent.diff),
      )} en "${overspent.name}". Reasignar ese monto mantendría tu plan en verde.`
    } else if (bestSaver) {
      message = `Vas ${formatCurrency(
        bestSaver.diff,
      )} por debajo de lo presupuestado en "${bestSaver.name}". Podrías mover ese ahorro a tus metas.`
    } else {
      message = 'Tu gasto real coincide con lo presupuestado. Excelente disciplina este período.'
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-primary p-5 text-primary-foreground shadow-sm">
      <div className="absolute -right-6 -top-6 size-24 rounded-full bg-primary-foreground/10" />
      <div className="relative">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
          <Lightbulb className="size-4" />
        </span>
        <h3 className="mt-3 text-sm font-semibold">Recomendación</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-primary-foreground/80 text-pretty">
          {message}
        </p>
      </div>
    </div>
  )
}
