import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getDashboardData } = vi.hoisted(() => ({ getDashboardData: vi.fn() }))
const navigation = vi.hoisted(() => ({ pathname: '/dashboard', pending: false, push: vi.fn() }))

vi.mock('@/actions/dashboard/get-dashboard-data', () => ({ getDashboardData }))
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
  useTransition: () => [navigation.pending, (callback: () => void) => callback()],
}))
vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useTransition: () => [navigation.pending, (callback: () => void) => callback()],
  }
})

import {
  DashboardPeriodHeader,
  hrefForPeriod,
  nextPeriod,
  previousPeriod,
} from '@/app/(financeapp)/dashboard/_components/action-dashboard'
import Dashboard, { parseDashboardPeriod } from '@/app/(financeapp)/dashboard/page'

const now = new Date(Date.UTC(2026, 5, 15))
const dashboardData = {
  period: { mode: 'monthly' as const, year: 2026, month: 5 },
  kpis: {
    incomePlanned: 0,
    incomeActual: 0,
    expensePlanned: 0,
    expenseActual: 0,
    netPlanned: 0,
    netActual: 0,
    available: 0,
  },
  groups: [],
  budgetVsActual: [],
  monthlyTrend: [],
  expenseByGroup: [],
  accounts: [],
  aggregateBalance: null,
  empty: { hasBudget: false, hasTransactions: false, hasAccounts: false, isEmpty: true },
}

describe('dashboard URL period selection', () => {
  beforeEach(() => {
    navigation.pathname = '/dashboard'
    navigation.pending = false
    navigation.push.mockReset()
    getDashboardData.mockReset()
    vi.useRealTimers()
  })
  it('parses only canonical scalar monthly and annual periods', () => {
    expect(parseDashboardPeriod({ mode: 'monthly', year: '2026', month: '11' }, now)).toEqual({
      mode: 'monthly',
      year: 2026,
      month: 11,
    })
    expect(parseDashboardPeriod({ mode: 'annual', year: '2026' }, now)).toEqual({
      mode: 'annual',
      year: 2026,
    })
  })

  it.each([
    {},
    { mode: ['monthly', 'annual'], year: '2026', month: '5' },
    { mode: 'monthly', year: '2026' },
    { mode: 'annual', year: '2026', month: '5' },
    { mode: 'monthly', year: '1999', month: '5' },
    { mode: 'monthly', year: '2026', month: '12' },
    { mode: 'monthly', year: '2026', month: '5', extra: 'unsafe' },
  ])('defaults invalid query %o to the current UTC month', query => {
    expect(parseDashboardPeriod(query, now)).toEqual({ mode: 'monthly', year: 2026, month: 5 })
  })

  it('calls the server action once with a valid parsed union', async () => {
    getDashboardData.mockResolvedValueOnce({ ok: true, data: dashboardData })

    await Dashboard({ searchParams: Promise.resolve({ mode: 'annual', year: '2026' }) })

    expect(getDashboardData).toHaveBeenCalledTimes(1)
    expect(getDashboardData).toHaveBeenCalledWith({ mode: 'annual', year: 2026 })
  })

  it('renders the selected server period in the dashboard header', async () => {
    getDashboardData.mockResolvedValueOnce({ ok: true, data: dashboardData })

    render(
      await Dashboard({
        searchParams: Promise.resolve({ mode: 'monthly', year: '2026', month: '5' }),
      }),
    )

    expect(screen.getByRole('heading', { name: 'Presupuesto vs Realidad' })).toBeInTheDocument()
    expect(screen.getByText('junio de 2026')).toBeInTheDocument()
  })

  it('renders a non-sensitive retryable alert without dashboard controls when data is unavailable', async () => {
    getDashboardData.mockResolvedValueOnce({ ok: false, code: 'UNAVAILABLE' })

    render(
      await Dashboard({
        searchParams: Promise.resolve({ mode: 'monthly', year: '2026', month: '5' }),
      }),
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los datos del panel. Intenta actualizar la página.',
    )
    expect(
      screen.queryByRole('heading', { name: 'Presupuesto vs Realidad' }),
    ).not.toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})

describe('DashboardPeriodHeader', () => {
  it('renders the exact Spanish copy, selected mode, and balance states', () => {
    const { rerender } = render(
      <DashboardPeriodHeader period={{ mode: 'monthly', year: 2026, month: 0 }} netActual={12} />,
    )

    expect(screen.getByRole('heading', { name: 'Presupuesto vs Realidad' })).toBeInTheDocument()
    expect(
      screen.getByText('Compara tus flujos estimados contra tu desempeño real.'),
    ).toBeInTheDocument()
    expect(screen.getByText('enero de 2026')).toBeInTheDocument()
    expect(screen.getByText('Superávit')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Modo del período' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mensual' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Anual' })).toHaveAttribute('aria-pressed', 'false')

    rerender(<DashboardPeriodHeader period={{ mode: 'annual', year: 2026 }} netActual={-1} />)
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText('Déficit')).toBeInTheDocument()

    rerender(<DashboardPeriodHeader period={{ mode: 'annual', year: 2026 }} netActual={0} />)
    expect(screen.getByText('Balance neutro')).toBeInTheDocument()
  })

  it('builds pathname-prefixed canonical URLs and crosses period boundaries', () => {
    expect(hrefForPeriod('/dashboard', { mode: 'monthly', year: 2026, month: 11 })).toBe(
      '/dashboard?mode=monthly&year=2026&month=11',
    )
    expect(hrefForPeriod('/dashboard', { mode: 'annual', year: 2026 })).toBe(
      '/dashboard?mode=annual&year=2026',
    )
    expect(nextPeriod({ mode: 'monthly', year: 2026, month: 11 })).toEqual({
      mode: 'monthly',
      year: 2027,
      month: 0,
    })
    expect(previousPeriod({ mode: 'monthly', year: 2027, month: 0 })).toEqual({
      mode: 'monthly',
      year: 2026,
      month: 11,
    })
    expect(nextPeriod({ mode: 'annual', year: 2026 })).toEqual({ mode: 'annual', year: 2027 })
    expect(previousPeriod({ mode: 'annual', year: 2027 })).toEqual({ mode: 'annual', year: 2026 })
  })

  it('pushes canonical URLs from mouse and keyboard controls and preserves the year on mode changes', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <DashboardPeriodHeader period={{ mode: 'monthly', year: 2026, month: 11 }} netActual={0} />,
    )

    await user.click(screen.getByRole('button', { name: 'Período siguiente' }))
    expect(navigation.push).toHaveBeenLastCalledWith('/dashboard?mode=monthly&year=2027&month=0')

    rerender(<DashboardPeriodHeader period={{ mode: 'annual', year: 2026 }} netActual={0} />)
    const monthly = screen.getByRole('button', { name: 'Mensual' })
    monthly.focus()
    await user.keyboard('{Enter}')
    expect(navigation.push).toHaveBeenLastCalledWith(
      `/dashboard?mode=monthly&year=2026&month=${new Date().getUTCMonth()}`,
    )
  })

  it('keeps controls accessible while pending and announces only matching refreshed server props', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <DashboardPeriodHeader period={{ mode: 'annual', year: 2026 }} netActual={0} />,
    )
    const next = screen.getByRole('button', { name: 'Período siguiente' })
    next.focus()

    await user.click(next)

    navigation.pending = true
    rerender(<DashboardPeriodHeader period={{ mode: 'annual', year: 2026 }} netActual={0} />)
    expect(next).toHaveFocus()
    expect(next).toBeDisabled()
    expect(screen.getByLabelText('Presupuesto vs Realidad')).toHaveAttribute('aria-busy', 'true')

    navigation.pending = false
    rerender(<DashboardPeriodHeader period={{ mode: 'annual', year: 2027 }} netActual={0} />)
    expect(screen.getByRole('status')).toHaveTextContent('Período actualizado: 2027')
  })
})
