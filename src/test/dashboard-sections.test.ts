import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'

const mocks = vi.hoisted(() => ({
  FinanceChartsClient: vi.fn(() => null),
  repoActuals: vi.fn(),
  repoPlan: vi.fn(),
  repoAccounts: vi.fn(),
}))

vi.mock('@/app/(financeapp)/dashboard/_components/finance-charts-client', () => ({
  FinanceChartsClient: mocks.FinanceChartsClient,
}))
// Sections must never issue their own reads — they consume page-created promises only.
vi.mock('@/repository/dashboard/actuals', () => ({ getDashboardActuals: mocks.repoActuals }))
vi.mock('@/repository/dashboard/budget', () => ({ getDashboardPlan: mocks.repoPlan }))
vi.mock('@/repository/dashboard/accounts', () => ({ getDashboardAccounts: mocks.repoAccounts }))

import { AccountsSection } from '@/app/(financeapp)/dashboard/_components/accounts-section'
import { BudgetSection } from '@/app/(financeapp)/dashboard/_components/budget-section'
import { ChartsSection } from '@/app/(financeapp)/dashboard/_components/charts-section'
import { InsightSection } from '@/app/(financeapp)/dashboard/_components/insight-section'
import { KpisSection } from '@/app/(financeapp)/dashboard/_components/kpis-section'
import { SectionUnavailable } from '@/app/(financeapp)/dashboard/_components/section-unavailable'
import { AccountsWidget } from '@/app/(financeapp)/dashboard/_components/accounts-widget'
import { BudgetTable } from '@/app/(financeapp)/dashboard/_components/budget-table'
import { InsightCard } from '@/app/(financeapp)/dashboard/_components/insight-card'
import { KpiCards } from '@/app/(financeapp)/dashboard/_components/kpi-cards'
import type { DashboardActual } from '@/lib/dashboard/actuals'
import type { DashboardAccount } from '@/lib/dashboard/accounts'
import type { DashboardPeriod } from '@/lib/dashboard/period'
import type { DashboardPlan } from '@/lib/dashboard/plan'
import type { SourceResult } from '@/lib/dashboard/source-result'

const monthly: DashboardPeriod = { mode: 'monthly', year: 2026, month: 0 }
const annual: DashboardPeriod = { mode: 'annual', year: 2026 }

const plan: DashboardPlan = {
  id: 'budget-1',
  name: 'Household budget',
  incomePlanned: 1000,
  expensePlanned: 800,
  groups: [
    {
      id: 'income-group',
      name: 'Income',
      kind: 'income',
      sortOrder: 0,
      planned: 1000,
      categories: [{ id: 'salary-plan', categoryId: 'salary', name: 'Salary', planned: 1000 }],
    },
    {
      id: 'expense-group',
      name: 'Essentials',
      kind: 'expense',
      sortOrder: 1,
      planned: 800,
      categories: [{ id: 'rent-plan', categoryId: 'rent', name: 'Rent', planned: 800 }],
    },
  ],
}

const actuals: DashboardActual[] = [
  { categoryId: 'salary', categoryName: 'Salary', type: 'income', month: 0, total: 1200 },
  { categoryId: 'rent', categoryName: 'Rent', type: 'expense', month: 0, total: 700 },
  { categoryId: 'food', categoryName: 'Food', type: 'expense', month: 0, total: 50 },
  { categoryId: null, categoryName: null, type: 'expense', month: 0, total: 25 },
]

const accounts: DashboardAccount[] = [
  { id: 'account-usd', name: 'Cash', type: 'cash', currency: 'USD', balance: 500 },
  { id: 'account-eur', name: 'Legacy bank', type: 'bank', currency: 'EUR', balance: 200 },
]

function ok<T>(data: T): SourceResult<T> {
  return { ok: true, data }
}

function unavailable<T>(): SourceResult<T> {
  return { ok: false, code: 'UNAVAILABLE' }
}

function props<P>(element: ReactElement): P {
  return element.props as P
}

describe('dashboard server sections', () => {
  it('KpisSection projects the shared plan and actuals into widget KPIs', async () => {
    const element = await KpisSection({
      actuals: Promise.resolve(ok(actuals)),
      plan: Promise.resolve(ok(plan)),
      period: monthly,
    })

    expect(element.type).toBe(KpiCards)
    expect(props<{ kpis: unknown }>(element).kpis).toEqual({
      incomePlanned: 1000,
      incomeActual: 1200,
      expensePlanned: 800,
      expenseActual: 775,
      netPlanned: 200,
      netActual: 425,
      available: 175,
    })
  })

  it('ChartsSection serializes only the narrow DashboardCharts payload to the dynamic client', async () => {
    const element = await ChartsSection({
      actuals: Promise.resolve(ok(actuals)),
      plan: Promise.resolve(ok(plan)),
      period: monthly,
    })

    expect(element.type).toBe(mocks.FinanceChartsClient)
    const chartProps = props<Record<string, unknown>>(element)
    expect(Object.keys(chartProps).sort()).toEqual([
      'budgetVsActual',
      'expenseByGroup',
      'isEmpty',
      'monthlyTrend',
      'viewMode',
    ])
    expect(chartProps.viewMode).toBe('monthly')
    expect(chartProps.isEmpty).toBe(false)
    expect(chartProps.budgetVsActual).toEqual([
      { label: 'Income', estimado: 1000, real: 1200 },
      { label: 'Expenses', estimado: 800, real: 775 },
    ])
    expect(chartProps.monthlyTrend).toEqual([])
    expect(chartProps.expenseByGroup).toEqual([
      { name: 'Essentials', value: 700 },
      { name: 'Unplanned expense', value: 50 },
      { name: 'Uncategorized', value: 25 },
    ])
  })

  it('ChartsSection emits exactly twelve chronological annual points, zero-filled', async () => {
    const sparse: DashboardActual[] = [
      { categoryId: 'salary', categoryName: 'Salary', type: 'income', month: 0, total: 1200 },
      { categoryId: 'rent', categoryName: 'Rent', type: 'expense', month: 5, total: 700 },
    ]

    const element = await ChartsSection({
      actuals: Promise.resolve(ok(sparse)),
      plan: Promise.resolve(ok(plan)),
      period: annual,
    })

    const chartProps = props<{ monthlyTrend: unknown[] }>(element)
    expect(chartProps.monthlyTrend).toHaveLength(12)
    expect(chartProps.monthlyTrend[0]).toEqual({ label: 'Jan', ingreso: 1200, gasto: 0 })
    expect(chartProps.monthlyTrend[5]).toEqual({ label: 'Jun', ingreso: 0, gasto: 700 })
    expect(chartProps.monthlyTrend[11]).toEqual({ label: 'Dec', ingreso: 0, gasto: 0 })
  })

  it('ChartsSection reports isEmpty only when there is no budget and no activity', async () => {
    const element = await ChartsSection({
      actuals: Promise.resolve(ok([])),
      plan: Promise.resolve(ok(null)),
      period: monthly,
    })

    expect(props<{ isEmpty: unknown }>(element).isEmpty).toBe(true)
  })

  it('BudgetSection projects ordered rows into the budget table', async () => {
    const element = await BudgetSection({
      actuals: Promise.resolve(ok(actuals)),
      plan: Promise.resolve(ok(plan)),
      period: monthly,
    })

    expect(element.type).toBe(BudgetTable)
    const tableProps = props<{ groups: Array<{ id: string; planned: number; actual: number }>; viewMode: unknown }>(element)
    expect(tableProps.viewMode).toBe('monthly')
    expect(tableProps.groups.map(group => group.id)).toEqual([
      'income-group',
      'expense-group',
      'unplanned-expense',
      'uncategorized-expense',
    ])
    expect(tableProps.groups[1]).toMatchObject({ id: 'expense-group', planned: 800, actual: 700 })
  })

  it('AccountsSection presents accounts through the account widget contract', async () => {
    const element = await AccountsSection({ accounts: Promise.resolve(ok(accounts)) })

    expect(element.type).toBe(AccountsWidget)
    const widgetProps = props<{ accounts: unknown[]; aggregateBalance: unknown }>(element)
    expect(widgetProps.accounts).toEqual([
      {
        id: 'account-usd',
        name: 'Cash',
        type: 'cash',
        presentation: 'typed',
        currency: 'USD',
        balance: 500,
      },
      {
        id: 'account-eur',
        name: 'Legacy bank',
        type: null,
        presentation: 'generic',
        currency: 'EUR',
        balance: 200,
      },
    ])
    expect(widgetProps.aggregateBalance).toBeNull()
  })

  it('InsightSection feeds the insight card with projected groups', async () => {
    const element = await InsightSection({
      actuals: Promise.resolve(ok(actuals)),
      plan: Promise.resolve(ok(plan)),
      period: monthly,
    })

    expect(element.type).toBe(InsightCard)
    expect(Array.isArray(props<{ groups: unknown[] }>(element).groups)).toBe(true)
  })

  it('KpisSection exposes UNAVAILABLE without fabricating KPIs', async () => {
    const element = await KpisSection({
      actuals: Promise.resolve(unavailable<DashboardActual[]>()),
      plan: Promise.resolve(ok(plan)),
      period: monthly,
    })

    expect(element.type).toBe(SectionUnavailable)
  })

  it('ChartsSection exposes UNAVAILABLE when the plan source fails', async () => {
    const element = await ChartsSection({
      actuals: Promise.resolve(ok(actuals)),
      plan: Promise.resolve(unavailable<DashboardPlan | null>()),
      period: monthly,
    })

    expect(element.type).toBe(SectionUnavailable)
  })

  it('BudgetSection exposes UNAVAILABLE without fabricated rows', async () => {
    const element = await BudgetSection({
      actuals: Promise.resolve(unavailable<DashboardActual[]>()),
      plan: Promise.resolve(unavailable<DashboardPlan | null>()),
      period: monthly,
    })

    expect(element.type).toBe(SectionUnavailable)
  })

  it('AccountsSection exposes UNAVAILABLE without fabricated accounts', async () => {
    const element = await AccountsSection({ accounts: Promise.resolve(unavailable<DashboardAccount[]>()) })

    expect(element.type).toBe(SectionUnavailable)
  })

  it('InsightSection exposes UNAVAILABLE', async () => {
    const element = await InsightSection({
      actuals: Promise.resolve(unavailable<DashboardActual[]>()),
      plan: Promise.resolve(ok(plan)),
      period: monthly,
    })

    expect(element.type).toBe(SectionUnavailable)
  })

  it('keeps unrelated sections renderable when one source is unavailable', async () => {
    const kpis = await KpisSection({
      actuals: Promise.resolve(unavailable<DashboardActual[]>()),
      plan: Promise.resolve(ok(plan)),
      period: monthly,
    })
    const accountsElement = await AccountsSection({ accounts: Promise.resolve(ok(accounts)) })

    expect(kpis.type).toBe(SectionUnavailable)
    expect(accountsElement.type).toBe(AccountsWidget)
  })

  it('sections never issue their own reads — they consume page-created promises only', async () => {
    await KpisSection({
      actuals: Promise.resolve(ok(actuals)),
      plan: Promise.resolve(ok(plan)),
      period: monthly,
    })
    await ChartsSection({
      actuals: Promise.resolve(ok(actuals)),
      plan: Promise.resolve(ok(plan)),
      period: monthly,
    })
    await BudgetSection({
      actuals: Promise.resolve(ok(actuals)),
      plan: Promise.resolve(ok(plan)),
      period: monthly,
    })
    await AccountsSection({ accounts: Promise.resolve(ok(accounts)) })
    await InsightSection({
      actuals: Promise.resolve(ok(actuals)),
      plan: Promise.resolve(ok(plan)),
      period: monthly,
    })

    expect(mocks.repoActuals).not.toHaveBeenCalled()
    expect(mocks.repoPlan).not.toHaveBeenCalled()
    expect(mocks.repoAccounts).not.toHaveBeenCalled()
  })
})