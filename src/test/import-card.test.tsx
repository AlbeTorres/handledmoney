import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCSVState } from '@/store/CSVState'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const localeState = vi.hoisted(() => ({ value: 'en' }))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
  useLocale: () => localeState.value,
}))

// Native-select stand-in for the Radix Select (jsdom portals are not reliable).
vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children, ...rest }: any) => (
    <select value={value ?? ''} onChange={e => onValueChange(e.target.value)} {...rest}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <option value='' disabled>
      {placeholder}
    </option>
  ),
  SelectContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SelectItem: ({ value, children, disabled }: any) => (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: React.PropsWithChildren) => <table>{children}</table>,
  TableHeader: ({ children }: React.PropsWithChildren) => <thead>{children}</thead>,
  TableBody: ({ children }: React.PropsWithChildren) => <tbody>{children}</tbody>,
  TableRow: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <tr {...props}>{children}</tr>
  ),
  TableHead: ({ children }: React.PropsWithChildren) => <th>{children}</th>,
  TableCell: ({ children }: React.PropsWithChildren) => <td>{children}</td>,
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { ImportCard } from '@/components/ImportCard'

// ── Helpers ────────────────────────────────────────────────────────────────────

const EMPTY_META = {
  delimiter: '',
  linebreak: '',
  aborted: false,
  truncated: false,
  cursor: 0,
}

const ACCOUNTS = [{ id: 'acc-1', name: 'Checking' }]

// CSV 1 style: MM/DD dates, all-positive amounts, no type column.
const CSV = [
  ['Date', 'Description', 'Amount'],
  ['1/24/2024', 'Rebtel', '$3.49'],
  ['1/25/2024', 'Opening balance', '$100.00'],
]

// Both date parts <= 12 → ambiguous (M0.3 selector case).
const AMBIGUOUS_CSV = [
  ['Date', 'Description', 'Amount'],
  ['01/02/2024', 'Rebtel', '$3.49'],
]

async function mapRequiredColumns(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByTestId('mapping-select-0'), 'date')
  await user.selectOptions(screen.getByTestId('mapping-select-1'), 'payee')
  await user.selectOptions(screen.getByTestId('mapping-select-2'), 'amount')
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ImportCard', () => {
  beforeEach(() => {
    localeState.value = 'en'
    useCSVState.setState({
      isImporting: 'IMPORT',
      config: { accountId: '', typeMode: 'auto', dateOrder: null, numberFormat: 'us' },
      normalizedRows: [],
      importResult: { data: [], errors: [], meta: EMPTY_META },
    })
  })

  // ── Continue gating (CSV-IMP-01/02) ────────────────────────────────────────

  it('blocks Continue until an account is selected (CSV-IMP-01)', async () => {
    const user = userEvent.setup()
    render(<ImportCard data={CSV} accounts={ACCOUNTS} onCancel={vi.fn()} />)

    await mapRequiredColumns(user)

    const continueButton = screen.getByTestId('continue-button') as HTMLButtonElement
    expect(continueButton.disabled).toBe(true)
  })

  it('blocks Continue until the required mappings are complete (CSV-IMP-02)', async () => {
    const user = userEvent.setup()
    render(<ImportCard data={CSV} accounts={ACCOUNTS} onCancel={vi.fn()} />)

    await user.selectOptions(screen.getByTestId('account-select'), 'acc-1')
    // amount + date mapped, payee missing
    await user.selectOptions(screen.getByTestId('mapping-select-0'), 'date')
    await user.selectOptions(screen.getByTestId('mapping-select-2'), 'amount')

    const continueButton = screen.getByTestId('continue-button') as HTMLButtonElement
    expect(continueButton.disabled).toBe(true)

    await user.selectOptions(screen.getByTestId('mapping-select-1'), 'payee')
    expect(continueButton.disabled).toBe(false)
  })

  // ── REVIEW transition (D5) ─────────────────────────────────────────────────

  it('normalizes the mapped rows and transitions to REVIEW on Continue', async () => {
    const user = userEvent.setup()
    render(<ImportCard data={CSV} accounts={ACCOUNTS} onCancel={vi.fn()} />)

    await user.selectOptions(screen.getByTestId('account-select'), 'acc-1')
    await mapRequiredColumns(user)
    await user.click(screen.getByTestId('continue-button'))

    const state = useCSVState.getState()
    expect(state.isImporting).toBe('REVIEW')
    expect(state.normalizedRows).toHaveLength(2)
    expect(state.normalizedRows[0]).toMatchObject({
      accountId: 'acc-1',
      payee: 'Rebtel',
      amount: 3.49,
      date: '2024-01-24',
      type: 'expense', // CSV-IMP-04: all-positive sign-only file defaults to expense
    })
    expect(state.normalizedRows[1]).toMatchObject({
      payee: 'Opening balance',
      amount: 100,
      date: '2024-01-25',
    })
    // dateOrder persisted to the store config for consistency
    expect(state.config.dateOrder).toBe('mm/dd')
  })

  // ── Mode switch re-normalizes (CSV-IMP-04) ─────────────────────────────────

  it('re-normalizes every row when the type mode switches', async () => {
    const user = userEvent.setup()
    render(<ImportCard data={CSV} accounts={ACCOUNTS} onCancel={vi.fn()} />)

    await user.selectOptions(screen.getByTestId('account-select'), 'acc-1')
    await mapRequiredColumns(user)
    await user.click(screen.getByTestId('continue-button'))
    expect(useCSVState.getState().normalizedRows.every(row => row.type === 'expense')).toBe(true)

    // Back to edit → switch mode to All income → Continue re-normalizes.
    useCSVState.setState({ isImporting: 'IMPORT' })
    await user.selectOptions(screen.getByTestId('type-mode-select'), 'all_income')
    await user.click(screen.getByTestId('continue-button'))

    const rows = useCSVState.getState().normalizedRows
    expect(rows).toHaveLength(2)
    expect(rows.every(row => row.type === 'income')).toBe(true)
  })

  // ── Date ambiguity selector + locale bias (CSV-IMP-06, M0.3) ───────────────

  it('shows the date-order selector biased to mm/dd for en when ambiguous', async () => {
    const user = userEvent.setup()
    localeState.value = 'en'
    render(<ImportCard data={AMBIGUOUS_CSV} accounts={ACCOUNTS} onCancel={vi.fn()} />)

    await user.selectOptions(screen.getByTestId('mapping-select-0'), 'date')

    const dateOrderSelect = screen.getByTestId('date-order-select') as HTMLSelectElement
    expect(dateOrderSelect).toBeTruthy()
    expect(dateOrderSelect.value).toBe('mm/dd')
  })

  it('biases the date-order selector to dd/mm for es when ambiguous', async () => {
    const user = userEvent.setup()
    localeState.value = 'es'
    render(<ImportCard data={AMBIGUOUS_CSV} accounts={ACCOUNTS} onCancel={vi.fn()} />)

    await user.selectOptions(screen.getByTestId('mapping-select-0'), 'date')

    const dateOrderSelect = screen.getByTestId('date-order-select') as HTMLSelectElement
    expect(dateOrderSelect.value).toBe('dd/mm')
  })

  it('requires a type mapping in map mode before Continue (M0.2)', async () => {
    const user = userEvent.setup()
    const csvWithType = [
      ['Details', 'Date', 'Description', 'Amount'],
      ['DEBIT', '08/10/2026', 'Grocery Store', '-120.50'],
    ]
    render(<ImportCard data={csvWithType} accounts={ACCOUNTS} onCancel={vi.fn()} />)

    await user.selectOptions(screen.getByTestId('account-select'), 'acc-1')
    await user.selectOptions(screen.getByTestId('type-mode-select'), 'map')
    // date + payee + amount mapped, type still missing
    await user.selectOptions(screen.getByTestId('mapping-select-1'), 'date')
    await user.selectOptions(screen.getByTestId('mapping-select-2'), 'payee')
    await user.selectOptions(screen.getByTestId('mapping-select-3'), 'amount')

    const continueButton = screen.getByTestId('continue-button') as HTMLButtonElement
    expect(continueButton.disabled).toBe(true)

    await user.selectOptions(screen.getByTestId('mapping-select-0'), 'type')
    expect(continueButton.disabled).toBe(false)
  })
})
