'use client'

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency, type ViewMode } from '@/lib/finance-data'

const DONUT_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

function axisFormat(value: number) {
  if (Math.abs(value) >= 1000) return `$${Math.round(value / 1000)}k`
  return `$${value}`
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-popover-foreground">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="capitalize">{p.name}</span>
          <span className="ml-auto font-mono font-medium text-popover-foreground">
            {formatCurrency(p.value)}
          </span>
        </p>
      ))}
    </div>
  )
}

export interface FinanceChartsProps {
  viewMode: ViewMode
  budgetVsActual: { label: string; estimado: number; real: number }[]
  monthlyTrend: { label: string; ingreso: number; gasto: number }[]
  expenseByGroup: { name: string; value: number }[]
  isEmpty?: boolean
}

export function FinanceCharts({
  viewMode,
  budgetVsActual,
  monthlyTrend,
  expenseByGroup,
  isEmpty = false,
}: FinanceChartsProps) {
  const totalExpense = expenseByGroup.reduce((s, d) => s + d.value, 0)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Bar chart */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md lg:col-span-3">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">
            {viewMode === 'monthly'
              ? 'Estimado vs Real'
              : 'Tendencia mensual del año'}
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {viewMode === 'monthly' ? (
              <>
                <Legend color="var(--chart-5)" label="Estimado" />
                <Legend color="var(--chart-2)" label="Real" />
              </>
            ) : (
              <>
                <Legend color="var(--chart-1)" label="Ingreso" />
                <Legend color="var(--chart-4)" label="Gasto" />
              </>
            )}
          </div>
        </div>

        {isEmpty ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            Sin datos para graficar en este período
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'monthly' ? (
              <BarChart data={budgetVsActual} barGap={6}>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={axisFormat}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                  content={<ChartTooltip />}
                />
                <Bar
                  dataKey="estimado"
                  name="Estimado"
                  fill="var(--chart-5)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={64}
                />
                <Bar
                  dataKey="real"
                  name="Real"
                  fill="var(--chart-2)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={64}
                />
              </BarChart>
            ) : (
              <BarChart data={monthlyTrend} barGap={2}>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                />
                <YAxis
                  tickFormatter={axisFormat}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                  content={<ChartTooltip />}
                />
                <Bar
                  dataKey="ingreso"
                  name="Ingreso"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="gasto"
                  name="Gasto"
                  fill="var(--chart-4)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Donut chart — legend reads dynamic group names */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md lg:col-span-2">
        <h2 className="mb-4 text-sm font-semibold">Gasto real por grupo</h2>

        {expenseByGroup.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Sin gastos en este período
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col">
            <div className="relative h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByGroup}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {expenseByGroup.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="font-mono text-lg font-semibold tabular-nums">
                  {formatCurrency(totalExpense)}
                </span>
              </div>
            </div>

            <ul className="flex w-full flex-1 flex-col gap-2">
              {expenseByGroup.map((entry, i) => {
                const share = totalExpense > 0 ? entry.value / totalExpense : 0
                return (
                  <li key={entry.name} className="flex items-center gap-2 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length],
                      }}
                    />
                    <span className="truncate">{entry.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                      {Math.round(share * 100)}%
                    </span>
                    <span className="w-16 text-right font-mono text-xs font-medium tabular-nums">
                      {formatCurrency(entry.value)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}
