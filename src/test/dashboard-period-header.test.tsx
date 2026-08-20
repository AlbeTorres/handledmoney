import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const navigation = vi.hoisted(() => ({
  pathname: '/dashboard',
  search: '',
  push: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
  useRouter: () => ({ push: navigation.push }),
}))

// FilterDropdown is a presentational client menu; this suite focuses on which
// period options ActionDashboard feeds it and what URL changes result.
const dropdowns = vi.hoisted(() => ({
  render: vi.fn(),
}))

vi.mock('@/components/FilterDropdown', () => ({
  default: (props: {
    label: string
    options: Array<{ label: string; value: string }>
    selected: string[]
    onChange: (values: string[]) => void
    icon?: unknown
    multiple?: boolean
  }) => {
    dropdowns.render(props)
    return (
      <div data-testid="period-dropdown" data-options={JSON.stringify(props.options.map(o => o.value))}>
        {props.options.map(option => (
          <button
            key={option.value}
            data-option-value={option.value}
            onClick={() => props.onChange([option.value])}
          >
            {option.label}
          </button>
        ))}
      </div>
    )
  },
}))

import { ActionDashboard } from '@/app/(financeapp)/dashboard/_components/action-dashboard'

type DropdownProps = {
  label: string
  options: Array<{ label: string; value: string }>
  selected: string[]
  onChange: (values: string[]) => void
}

function renderCalls(): DropdownProps[] {
  return dropdowns.render.mock.calls.map(call => call[0] as DropdownProps)
}

describe('dashboard URL period selection (ActionDashboard controls)', () => {
  beforeEach(() => {
    navigation.pathname = '/dashboard'
    navigation.search = ''
    navigation.push.mockReset()
    dropdowns.render.mockClear()
    vi.useRealTimers()
  })

  it('renders month, year, and mode options in monthly mode and omits month in annual mode', () => {
    const monthlyView = render(<ActionDashboard dashboardmode="monthly" />)
    const monthlyOptions = renderCalls().flatMap(call => call.options.map(option => option.value))
    expect(monthlyOptions).toContain('0')
    expect(monthlyOptions).toContain('11')
    expect(monthlyOptions).toContain('2000')
    expect(monthlyOptions).toContain('2100')
    expect(monthlyOptions).toContain('monthly')
    expect(monthlyOptions).toContain('annual')
    monthlyView.unmount()

    dropdowns.render.mockClear()
    render(<ActionDashboard dashboardmode="annual" />)
    const annualOptions = renderCalls().flatMap(call => call.options.map(option => option.value))
    expect(annualOptions).not.toContain('0')
    expect(annualOptions).not.toContain('11')
    expect(annualOptions).toContain('2000')
    expect(annualOptions).toContain('monthly')
    expect(annualOptions).toContain('annual')
  })

  it('defaults month to the current UTC month, year to the current UTC year, and mode to monthly', () => {
    render(<ActionDashboard dashboardmode="monthly" />)

    const calls = renderCalls()
    const monthDropdown = calls.find(call =>
      call.options.some(option => option.value === '0') &&
      call.options.some(option => option.value === '11'),
    )
    const yearDropdown = calls.find(call =>
      call.options.some(option => option.value === '2000') &&
      call.options.some(option => option.value === '2100'),
    )
    const modeDropdown = calls.find(call =>
      call.options.some(option => option.value === 'monthly') &&
      call.options.some(option => option.value === 'annual'),
    )

    expect(monthDropdown?.selected).toEqual([String(new Date().getUTCMonth())])
    expect(yearDropdown?.selected).toEqual([String(new Date().getUTCFullYear())])
    expect(modeDropdown?.selected).toEqual(['monthly'])
  })

  it('picks up existing month, year, and mode search params', () => {
    navigation.search = 'mode=annual&year=2024&month=3'

    render(<ActionDashboard dashboardmode="annual" />)

    const calls = renderCalls()
    const yearDropdown = calls.find(call =>
      call.options.some(option => option.value === '2000') &&
      call.options.some(option => option.value === '2100'),
    )
    const modeDropdown = calls.find(call =>
      call.options.some(option => option.value === 'monthly') &&
      call.options.some(option => option.value === 'annual'),
    )
    expect(yearDropdown?.selected).toEqual(['2024'])
    expect(modeDropdown?.selected).toEqual(['annual'])
  })

  it('pushes the canonical URL when a mode option is selected', async () => {
    const user = userEvent.setup()
    render(<ActionDashboard dashboardmode="monthly" />)

    await user.click(screen.getByRole('button', { name: 'Anual' }))

    expect(navigation.push).toHaveBeenLastCalledWith('/dashboard?mode=annual', { scroll: false })
  })

  it('pushes the canonical URL when a month option is selected', async () => {
    const user = userEvent.setup()
    render(<ActionDashboard dashboardmode="monthly" />)

    await user.click(screen.getByRole('button', { name: 'Marzo' }))

    expect(navigation.push).toHaveBeenLastCalledWith('/dashboard?month=2', { scroll: false })
  })

  it('pushes the canonical URL when a year option is selected', async () => {
    const user = userEvent.setup()
    render(<ActionDashboard dashboardmode="monthly" />)

    await user.click(screen.getByRole('button', { name: '2027' }))

    expect(navigation.push).toHaveBeenLastCalledWith('/dashboard?year=2027', { scroll: false })
  })
})