'use client'

import dynamic from 'next/dynamic'
import type { FinanceChartsProps } from './finance-charts'

const FinanceCharts = dynamic(
  () => import('./finance-charts').then(module => module.FinanceCharts),
  {
    ssr: false,
    loading: () => (
      <div className='rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground'>
        Cargando gráficos…
      </div>
    ),
  },
)

export function FinanceChartsClient(props: FinanceChartsProps) {
  return <FinanceCharts {...props} />
}
