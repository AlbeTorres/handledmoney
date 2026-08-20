import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AccountsWidget } from '@/app/(financeapp)/dashboard/_components/accounts-widget'
import { BudgetTable } from '@/app/(financeapp)/dashboard/_components/budget-table'
import { FinanceCharts } from '@/app/(financeapp)/dashboard/_components/finance-charts'
import { InsightCard } from '@/app/(financeapp)/dashboard/_components/insight-card'
import { KpiCards } from '@/app/(financeapp)/dashboard/_components/kpi-cards'
import { presentDashboardAccounts } from '@/lib/dashboard/account-presentation'
import { projectDashboardBudgetRows } from '@/lib/dashboard/budget'
import { projectDashboardCharts } from '@/lib/dashboard/charts'
import { projectDashboardKpis } from '@/lib/dashboard/kpis'
import { dashboardRange, type DashboardPeriod } from '@/lib/dashboard/period'
import { dashboardAccounts, dashboardActuals, dashboardPlan } from './fixtures/dashboard'

/**
 * Widget-contract tests fed by the COMPOSED projections (task 4.1): the
 * widgets receive exactly what the server sections project from the shared
 * sources. The legacy `buildDashboardViewModel` seam is gone.
 */

const monthly: DashboardPeriod = { mode: 'monthly', year: 2026, month: 0 }

function composedMonthly() {
  const range = dashboardRange(monthly)
  const actuals = dashboardActuals(range)
  const charts = projectDashboardCharts(monthly, dashboardPlan, actuals)
  const { groups } = projectDashboardBudgetRows(monthly, dashboardPlan, actuals)
  const accounts = presentDashboardAccounts(dashboardAccounts)
  return {
    kpis: projectDashboardKpis(monthly, dashboardPlan, actuals),
    charts,
    groups,
    accounts,
  }
}

function composedEmpty() {
  const actuals: never[] = []
  const charts = projectDashboardCharts(monthly, null, actuals)
  const { groups } = projectDashboardBudgetRows(monthly, null, actuals)
  const accounts = presentDashboardAccounts([])
  return {
    kpis: projectDashboardKpis(monthly, null, actuals),
    charts,
    groups,
    accounts,
  }
}

describe('read-only dashboard widgets (composed projections)', () => {
  it('renders the retained widgets from the composed projection output without controls', () => {
    const { kpis, charts, groups, accounts } = composedMonthly()

    render(
      <>
        <KpiCards kpis={kpis} />
        <FinanceCharts
          viewMode={monthly.mode}
          budgetVsActual={charts.budgetVsActual}
          monthlyTrend={charts.monthlyTrend}
          expenseByGroup={charts.expenseByGroup}
        />
        <BudgetTable groups={groups} viewMode={monthly.mode} />
        <AccountsWidget
          accounts={accounts.accounts}
          aggregateBalance={accounts.aggregateBalance}
        />
        <InsightCard groups={groups} />
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
    const { kpis, charts, groups, accounts } = composedEmpty()

    render(
      <>
        <KpiCards kpis={kpis} />
        <FinanceCharts
          viewMode={monthly.mode}
          budgetVsActual={charts.budgetVsActual}
          monthlyTrend={charts.monthlyTrend}
          expenseByGroup={charts.expenseByGroup}
          isEmpty
        />
        <BudgetTable groups={groups} viewMode={monthly.mode} />
        <AccountsWidget accounts={accounts.accounts} aggregateBalance={accounts.aggregateBalance} />
        <InsightCard groups={groups} />
      </>,
    )

    expect(screen.getByText('Sin datos para graficar en este período')).toBeInTheDocument()
    expect(screen.getByText('No hay categorías presupuestadas en este período')).toBeInTheDocument()
    expect(screen.getByText('No hay cuentas para mostrar')).toBeInTheDocument()
    expect(screen.getByText('Aún no hay suficientes movimientos para generar una recomendación.')).toBeInTheDocument()
  })

  it('renders each mixed-currency account separately without a combined balance', () => {
    const { accounts } = composedMonthly()

    render(
      <AccountsWidget
        accounts={accounts.accounts}
        aggregateBalance={accounts.aggregateBalance}
      />,
    )

    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('Legacy bank')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('EUR')).toBeInTheDocument()
    expect(screen.queryByText('Patrimonio neto')).not.toBeInTheDocument()
  })
})