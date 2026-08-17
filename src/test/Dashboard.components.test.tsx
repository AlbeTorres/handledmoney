import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AccountsWidget } from '@/app/(financeapp)/dashboard/_components/accounts-widget'
import { BudgetTable } from '@/app/(financeapp)/dashboard/_components/budget-table'
import { FinanceCharts } from '@/app/(financeapp)/dashboard/_components/finance-charts'
import { InsightCard } from '@/app/(financeapp)/dashboard/_components/insight-card'
import { KpiCards } from '@/app/(financeapp)/dashboard/_components/kpi-cards'
import { buildDashboardViewModel } from '@/lib/finance-data'
import { dashboardSnapshot } from './fixtures/dashboard'

const populated = buildDashboardViewModel(dashboardSnapshot, {
  mode: 'monthly',
  year: 2026,
  month: 0,
})

const empty = buildDashboardViewModel(
  { budget: null, categories: [], transactions: [], accounts: [] },
  { mode: 'monthly', year: 2026, month: 0 },
)

describe('read-only dashboard widgets', () => {
  it('renders the retained widgets from the minimal dashboard projection without controls', () => {
    render(
      <>
        <KpiCards kpis={populated.kpis} />
        <FinanceCharts
          viewMode={populated.period.mode}
          budgetVsActual={populated.budgetVsActual}
          monthlyTrend={populated.monthlyTrend}
          expenseByGroup={populated.expenseByGroup}
        />
        <BudgetTable groups={populated.groups} viewMode={populated.period.mode} />
        <AccountsWidget
          accounts={populated.accounts}
          aggregateBalance={populated.aggregateBalance}
        />
        <InsightCard groups={populated.groups} />
      </>,
    )

    expect(screen.getByText('Ingreso Real')).toBeInTheDocument()
    expect(screen.getByText('Estimado vs Real')).toBeInTheDocument()
    expect(screen.getAllByText('Essentials')).toHaveLength(2)
    expect(screen.getByText('Legacy bank')).toBeInTheDocument()
    expect(screen.getByText('Cuenta genérica')).toBeInTheDocument()
    expect(screen.getByText('Recomendación')).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('shows honest empty states for missing budget, chart, and accounts data', () => {
    render(
      <>
        <FinanceCharts
          viewMode={empty.period.mode}
          budgetVsActual={empty.budgetVsActual}
          monthlyTrend={empty.monthlyTrend}
          expenseByGroup={empty.expenseByGroup}
          isEmpty
        />
        <BudgetTable groups={empty.groups} viewMode={empty.period.mode} />
        <AccountsWidget accounts={empty.accounts} aggregateBalance={empty.aggregateBalance} />
        <InsightCard groups={empty.groups} />
      </>,
    )

    expect(screen.getByText('Sin datos para graficar en este período')).toBeInTheDocument()
    expect(screen.getByText('No hay categorías presupuestadas en este período')).toBeInTheDocument()
    expect(screen.getByText('No hay cuentas para mostrar')).toBeInTheDocument()
    expect(screen.getByText('Aún no hay suficientes movimientos para generar una recomendación.')).toBeInTheDocument()
  })

  it('renders each mixed-currency account separately without a combined balance', () => {
    render(
      <AccountsWidget
        accounts={populated.accounts}
        aggregateBalance={populated.aggregateBalance}
      />,
    )

    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('Legacy bank')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('EUR')).toBeInTheDocument()
    expect(screen.queryByText('Patrimonio neto')).not.toBeInTheDocument()
  })
})
