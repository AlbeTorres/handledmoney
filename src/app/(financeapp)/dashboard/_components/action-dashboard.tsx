'use client'

import FilterDropdown from '@/components/FilterDropdown'
import { useFilterParam } from '@/hooks/use-filter-params'
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
  const [month, setMonth] = useFilterParam('month')
  const [year, setYear] = useFilterParam('year')
  const [mode, setMode] = useFilterParam('mode')

  const selectedMonth = month.length === 0 ? [String(new Date().getUTCMonth())] : month
  const selectedYear = year.length === 0 ? [String(new Date().getUTCFullYear())] : year
  const selectedMode = mode.length === 0 ? ['monthly'] : mode

  return (
    <section className='rounded-md border border-border bg-card p-5'>
      <div className='flex items-center gap-2 flex-wrap'>
        {dashboardmode === 'monthly' && (
          <FilterDropdown
            label=''
            options={MONTHS}
            selected={selectedMonth} // Ejemplo de valores seleccionados
            onChange={values => setMonth(values)}
            multiple={false} // O false
            icon={Calendar} // O cualquier ícono de Lucide
          />
        )}

        <FilterDropdown
          label=''
          options={YEARS}
          selected={selectedYear} // Ejemplo de valores seleccionados
          onChange={values => setYear(values)}
          multiple={false} // O false
          icon={Calendar} // O cualquier ícono de Lucide
        />
        <FilterDropdown
          label=''
          options={MODES}
          selected={selectedMode} // Ejemplo de valores seleccionados
          onChange={values => setMode(values)}
          multiple={false} // O false
          icon={Calendar} // O cualquier ícono de Lucide
        />
      </div>
    </section>
  )
}
