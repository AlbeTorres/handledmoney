'use client'

import FilterDropdown from '@/components/FilterDropdown'
import { useFilterParam, useFilterParams } from '@/hooks/use-filter-params'
import { Calendar } from 'lucide-react'

const MIN_YEAR = 2000
const MAX_YEAR = 2100

const MONTHS = [
  { label: 'Enero', value: '0' },
  { label: 'Febrero', value: '1' },
  { label: 'Marzo', value: '2' },
  { label: 'Abril', value: '3' },
  { label: 'Mayo', value: '4' },
  { label: 'Junio', value: '5' },
  { label: 'Julio', value: '6' },
  { label: 'Agosto', value: '7' },
  { label: 'Septiembre', value: '8' },
  { label: 'Octubre', value: '9' },
  { label: 'Noviembre', value: '10' },
  { label: 'Diciembre', value: '11' },
]

const MODES = [
  { label: 'Mensual', value: 'monthly' },
  { label: 'Anual', value: 'annual' },
]

// http://localhost:3000/dashboard?mode=monthly&year=2001&month=7

const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => {
  const value = MIN_YEAR + i
  return { label: String(value), value: String(value) }
})

type DashboardMode = 'monthly' | 'annual'

interface Props {
  dashboardmode: DashboardMode
}

export function ActionDashboard({ dashboardmode }: Props) {
  const [month] = useFilterParam('month')
  const [year] = useFilterParam('year')
  const [mode] = useFilterParam('mode')
  const setFilterParams = useFilterParams()

  const selectedMonth = month.length === 0 ? String(new Date().getUTCMonth()) : month[0]
  const selectedYear = year.length === 0 ? String(new Date().getUTCFullYear()) : year[0]
  const selectedMode = mode.length === 0 ? 'monthly' : mode[0]

  // Every change pushes a complete, parser-valid period URL in one navigation:
  // switching mode drops `month` for annual (the parser forbids it) and
  // restores the default month for monthly (the parser requires it). Partial
  // or uncoordinated URLs would dead-end the page in the unavailable alert.
  const applyPeriod = (updates: { month?: string; year?: string; mode?: string }) => {
    const nextMode = updates.mode ?? selectedMode
    const nextYear = updates.year ?? selectedYear
    const nextMonth = updates.month ?? selectedMonth

    const params: Record<string, string[]> = { mode: [nextMode], year: [nextYear] }
    if (nextMode === 'annual') {
      params.month = []
    } else {
      params.month = [nextMonth]
    }
    setFilterParams(params)
  }

  return (
    <section className='rounded-md border border-border bg-card p-5'>
      <div className='flex items-center gap-2 flex-wrap'>
        {dashboardmode === 'monthly' && (
          <FilterDropdown
            label=''
            options={MONTHS}
            selected={month.length === 0 ? [String(new Date().getUTCMonth())] : month}
            onChange={values => applyPeriod({ month: values[0] })}
            multiple={false}
            icon={Calendar}
          />
        )}

        <FilterDropdown
          label=''
          options={YEARS}
          selected={year.length === 0 ? [String(new Date().getUTCFullYear())] : year}
          onChange={values => applyPeriod({ year: values[0] })}
          multiple={false}
          icon={Calendar}
        />
        <FilterDropdown
          label=''
          options={MODES}
          selected={mode.length === 0 ? ['monthly'] : mode}
          onChange={values => applyPeriod({ mode: values[0] })}
          multiple={false}
          icon={Calendar}
        />
      </div>
    </section>
  )
}