import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentType, ReactElement, ReactNode } from 'react'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  headers: vi.fn(),
  getDashboardActuals: vi.fn(),
  getDashboardPlan: vi.fn(),
  getDashboardAccounts: vi.fn(),
  getDashboardData: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: mocks.getSession } } }))
vi.mock('next/headers', () => ({ headers: mocks.headers }))
vi.mock('@/repository/dashboard/actuals', () => ({
  getDashboardActuals: mocks.getDashboardActuals,
}))
vi.mock('@/repository/dashboard/budget', () => ({ getDashboardPlan: mocks.getDashboardPlan }))
vi.mock('@/repository/dashboard/accounts', () => ({
  getDashboardAccounts: mocks.getDashboardAccounts,
}))
// The legacy action must no longer be part of the page read path.
vi.mock('@/actions/dashboard/get-dashboard', () => ({ getDashboardData: mocks.getDashboardData }))
// The chart section keeps the client dynamic; the page test only inspects props.
vi.mock('@/app/(financeapp)/dashboard/_components/finance-charts-client', () => ({
  FinanceChartsClient: () => null,
}))

import Dashboard from '@/app/(financeapp)/dashboard/page'
import { AccountsSection } from '@/app/(financeapp)/dashboard/_components/accounts-section'
import { BudgetSection } from '@/app/(financeapp)/dashboard/_components/budget-section'
import { ChartsSection } from '@/app/(financeapp)/dashboard/_components/charts-section'
import { InsightSection } from '@/app/(financeapp)/dashboard/_components/insight-section'
import { KpisSection } from '@/app/(financeapp)/dashboard/_components/kpis-section'
import { dashboardRange } from '@/lib/dashboard/period'
import type { DashboardActual } from '@/lib/dashboard/actuals'
import type { DashboardAccount } from '@/lib/dashboard/accounts'
import type { DashboardPlan } from '@/lib/dashboard/plan'

function collectByType<P>(node: ReactNode, type: ComponentType<P>): ReactElement<P>[] {
  if (node == null || typeof node !== 'object') return []
  const element = node as ReactElement<{ children?: ReactNode }>
  if (element.type === type) return [element as ReactElement<P>]
  const children = element.props.children
  if (Array.isArray(children)) return children.flatMap(child => collectByType(child, type))
  return collectByType(children, type)
}

function hasAlert(node: ReactNode): boolean {
  if (node == null || typeof node !== 'object') return false
  const element = node as ReactElement<{ children?: ReactNode; role?: string }>
  if (element.props.role === 'alert') return true
  const children = element.props.children
  if (Array.isArray(children)) return children.some(hasAlert)
  return hasAlert(children)
}

const actualsRows: DashboardActual[] = [
  { categoryId: 'salary', categoryName: 'Salary', type: 'income', month: 0, total: 1200 },
  { categoryId: null, categoryName: null, type: 'expense', month: 0, total: 25 },
]

const planRows: DashboardPlan = {
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
  ],
}

const accountsRows: DashboardAccount[] = [
  { id: 'a1', name: 'Cash', type: 'cash', currency: 'USD', balance: 500 },
]

describe('dashboard page read contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.headers.mockResolvedValue({})
    mocks.getSession.mockResolvedValue({ user: { id: 'caller-1' } })
    mocks.getDashboardActuals.mockResolvedValue(actualsRows)
    mocks.getDashboardPlan.mockResolvedValue(planRows)
    mocks.getDashboardAccounts.mockResolvedValue(accountsRows)
  })

  it('authenticates once, strictly parses the period, and starts exactly three shared sources', async () => {
    const element = await Dashboard({
      searchParams: Promise.resolve({ mode: 'monthly', year: '2026', month: '0' }),
    })

    expect(mocks.getSession).toHaveBeenCalledTimes(1)

    const expectedRange = dashboardRange({ mode: 'monthly', year: 2026, month: 0 })
    expect(mocks.getDashboardActuals).toHaveBeenCalledTimes(1)
    expect(mocks.getDashboardActuals).toHaveBeenCalledWith('caller-1', expectedRange)
    expect(mocks.getDashboardPlan).toHaveBeenCalledTimes(1)
    expect(mocks.getDashboardPlan).toHaveBeenCalledWith('caller-1')
    expect(mocks.getDashboardAccounts).toHaveBeenCalledTimes(1)
    expect(mocks.getDashboardAccounts).toHaveBeenCalledWith('caller-1')

    // The legacy action seam is no longer part of the page read path.
    expect(mocks.getDashboardData).not.toHaveBeenCalled()

    expect(collectByType(element, KpisSection)).toHaveLength(1)
    expect(collectByType(element, ChartsSection)).toHaveLength(1)
    expect(collectByType(element, BudgetSection)).toHaveLength(1)
    expect(collectByType(element, AccountsSection)).toHaveLength(1)
    expect(collectByType(element, InsightSection)).toHaveLength(1)
  })

  it('passes the same source promise instances to every consuming section', async () => {
    const element = await Dashboard({
      searchParams: Promise.resolve({ mode: 'monthly', year: '2026', month: '0' }),
    })

    const [kpis] = collectByType(element, KpisSection)
    const [charts] = collectByType(element, ChartsSection)
    const [budget] = collectByType(element, BudgetSection)
    const [insight] = collectByType(element, InsightSection)
    const [accounts] = collectByType(element, AccountsSection)

    // Shared promise identity: every consumer of a source gets the same instance.
    expect(kpis.props.actuals).toBe(charts.props.actuals)
    expect(charts.props.actuals).toBe(budget.props.actuals)
    expect(budget.props.actuals).toBe(insight.props.actuals)
    expect(kpis.props.plan).toBe(charts.props.plan)
    expect(charts.props.plan).toBe(budget.props.plan)
    expect(budget.props.plan).toBe(insight.props.plan)
    expect(accounts.props.accounts).toBeDefined()

    // The shared promises resolve to SourceResult envelopes.
    await expect(kpis.props.actuals).resolves.toEqual({ ok: true, data: actualsRows })
    await expect(kpis.props.plan).resolves.toEqual({ ok: true, data: planRows })
    await expect(accounts.props.accounts).resolves.toEqual({ ok: true, data: accountsRows })

    expect(kpis.props.period).toEqual({ mode: 'monthly', year: 2026, month: 0 })
  })

  it('returns the page element while the sources are still pending (unawaited sources)', async () => {
    let resolveActuals!: (rows: DashboardActual[]) => void
    mocks.getDashboardActuals.mockReturnValue(
      new Promise<DashboardActual[]>(resolve => {
        resolveActuals = resolve
      }),
    )

    const elementPromise = Dashboard({
      searchParams: Promise.resolve({ mode: 'monthly', year: '2026', month: '0' }),
    })

    const element = await Promise.race([
      elementPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('page awaited the pending actuals source')), 200),
      ),
    ])

    expect(collectByType(element, KpisSection)).toHaveLength(1)
    expect(mocks.getDashboardActuals).toHaveBeenCalledTimes(1)

    resolveActuals(actualsRows)
    await elementPromise
  })

  it('builds the annual range and shares it with the actuals source', async () => {
    const element = await Dashboard({
      searchParams: Promise.resolve({ mode: 'annual', year: '2026' }),
    })

    expect(mocks.getDashboardActuals).toHaveBeenCalledWith(
      'caller-1',
      dashboardRange({ mode: 'annual', year: 2026 }),
    )
    expect(mocks.getDashboardPlan).toHaveBeenCalledWith('caller-1')
    expect(mocks.getDashboardAccounts).toHaveBeenCalledWith('caller-1')

    const [kpis] = collectByType(element, KpisSection)
    expect(kpis.props.period).toEqual({ mode: 'annual', year: 2026 })
  })

  it.each([
    { mode: 'monthly', year: '2026', month: '0', extra: 'x' },
    { mode: 'monthly', year: '2026' },
    { mode: 'monthly', year: '2026', month: '12' },
    { mode: 'monthly', year: '2026', month: ['0'] },
    { mode: 'annual', year: '2026', month: '0' },
    { mode: 'bogus', year: '2026' },
  ])('rejects the invalid period %o before any source call with the canonical alert', async raw => {
    const element = await Dashboard({ searchParams: Promise.resolve(raw) })

    expect(hasAlert(element)).toBe(true)
    expect(mocks.getDashboardActuals).not.toHaveBeenCalled()
    expect(mocks.getDashboardPlan).not.toHaveBeenCalled()
    expect(mocks.getDashboardAccounts).not.toHaveBeenCalled()
    expect(mocks.getSession).toHaveBeenCalledTimes(1)
  })

  it('keeps the canonical unauthenticated response without starting any source', async () => {
    mocks.getSession.mockResolvedValue(null)

    const element = await Dashboard({
      searchParams: Promise.resolve({ mode: 'monthly', year: '2026', month: '0' }),
    })

    expect(hasAlert(element)).toBe(true)
    expect(mocks.getDashboardActuals).not.toHaveBeenCalled()
    expect(mocks.getDashboardPlan).not.toHaveBeenCalled()
    expect(mocks.getDashboardAccounts).not.toHaveBeenCalled()
  })

  it('wraps a rejected source into the UNAVAILABLE envelope without retrying', async () => {
    mocks.getDashboardActuals.mockRejectedValue(new Error('database connection refused'))

    const element = await Dashboard({
      searchParams: Promise.resolve({ mode: 'monthly', year: '2026', month: '0' }),
    })

    const [kpis] = collectByType(element, KpisSection)
    await expect(kpis.props.actuals).resolves.toEqual({ ok: false, code: 'UNAVAILABLE' })
    await expect(kpis.props.plan).resolves.toEqual({ ok: true, data: planRows })
    expect(mocks.getDashboardActuals).toHaveBeenCalledTimes(1)
  })
})