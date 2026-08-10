import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCSVState } from '@/store/CSVState'
import type { NormalizedRow } from '@/lib/csv/types'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { onSubmitMock } = vi.hoisted(() => ({
  onSubmitMock: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}))

// Native-select stand-in for the Radix Select (BulkTypeDrawer).
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

// Sheet renders directly when open (jsdom has no Radix portals).
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ open, children }: React.PropsWithChildren<{ open: boolean; onOpenChange: (open: boolean) => void }>) =>
    open ? <div data-testid='sheet' data-state='open'>{children}</div> : null,
  SheetContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SheetHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SheetTitle: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

vi.mock('@/components/ui/checkbox', () => ({
  // The real Radix Checkbox maps checked='indeterminate' to the DOM
  // indeterminate property; jsdom doesn't apply it from a JSX prop, so the
  // mock surfaces it as a data attribute (same component contract).
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => {
    const indeterminate = checked === 'indeterminate'
    return (
      <input
        type='checkbox'
        checked={!!checked && !indeterminate}
        data-indeterminate={indeterminate || undefined}
        onChange={e => onCheckedChange?.(e.target.checked)}
        {...props}
      />
    )
  },
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

import { ReviewImportTable } from '@/components/ReviewImportTable'

// ── Helpers ────────────────────────────────────────────────────────────────────

const makeRow = (overrides: Partial<NormalizedRow> = {}): NormalizedRow => ({
  accountId: 'acc-1',
  payee: 'Rebtel',
  notes: '',
  date: '2024-01-24',
  amount: 3.49,
  type: 'expense',
  possibleDuplicate: false,
  payeeMissing: false,
  typeConflict: false,
  excluded: false,
  ...overrides,
})

const ROWS: NormalizedRow[] = [
  makeRow({ possibleDuplicate: true, payeeMissing: true }),
  makeRow({
    payee: 'Opening balance',
    notes: 'initial',
    date: '2024-01-25',
    amount: 100,
  }),
  makeRow({ payee: 'Grocery Store', amount: 120.5, type: 'expense', typeConflict: true }),
]

const DEFAULT_CONFIG = { accountId: 'acc-1', typeMode: 'auto' as const, dateOrder: null, numberFormat: 'us' as const }

function seedStore() {
  useCSVState.setState({
    isImporting: 'REVIEW',
    config: DEFAULT_CONFIG,
    normalizedRows: ROWS,
  })
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ReviewImportTable', () => {
  beforeEach(() => {
    onSubmitMock.mockReset()
    onSubmitMock.mockResolvedValue({ success: true })
    seedStore()
  })

  it('renders every row with +1 numbering and the per-row flags (CSV-IMP-08)', () => {
    render(<ReviewImportTable onBack={vi.fn()} onSubmit={onSubmitMock} />)

    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()

    expect(screen.getByText('import.flag_duplicate')).toBeTruthy()
    expect(screen.getByText('import.flag_payee_missing')).toBeTruthy()
    expect(screen.getByText('import.flag_type_conflict')).toBeTruthy()

    // amounts formatted to 2 decimals
    expect(screen.getByText('3.49')).toBeTruthy()
    expect(screen.getByText('100.00')).toBeTruthy()
    expect(screen.getByText('120.50')).toBeTruthy()
  })

  it('select-all checks every row and an unchecked row leaves the header indeterminate', async () => {
    const user = userEvent.setup()
    render(<ReviewImportTable onBack={vi.fn()} onSubmit={onSubmitMock} />)

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(4) // select-all + 3 rows

    await user.click(checkboxes[0])
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true)
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(true)
    expect((checkboxes[3] as HTMLInputElement).checked).toBe(true)

    // uncheck one row → select-all becomes indeterminate (not fully checked)
    await user.click(checkboxes[1])
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(false)
    expect((checkboxes[0] as HTMLInputElement).dataset.indeterminate).toBe('true')

    // select-all again re-selects everything
    await user.click(checkboxes[0])
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true)
  })

  it('applies a bulk type change to the selected rows (CSV-IMP-08)', async () => {
    const user = userEvent.setup()
    render(<ReviewImportTable onBack={vi.fn()} onSubmit={onSubmitMock} />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // row 1 (Rebtel)
    await user.click(checkboxes[2]) // row 2 (Opening balance)

    await user.click(screen.getByTestId('bulk-type-button'))
    await user.selectOptions(screen.getByTestId('bulk-type-select'), 'income')
    await user.click(screen.getByTestId('bulk-type-submit-button'))

    const rows = useCSVState.getState().normalizedRows
    expect(rows[0].type).toBe('income')
    expect(rows[1].type).toBe('income')
    // unselected row keeps its type
    expect(rows[2].type).toBe('expense')
  })

  it('excludes selected rows and submits the filtered payload (D6, CSV-IMP-08)', async () => {
    const user = userEvent.setup()
    render(<ReviewImportTable onBack={vi.fn()} onSubmit={onSubmitMock} />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // row 1 (Rebtel)
    await user.click(checkboxes[3]) // row 3 (Client Payment)

    await user.click(screen.getByTestId('bulk-exclude-button'))

    const rows = useCSVState.getState().normalizedRows
    expect(rows[0].excluded).toBe(true)
    expect(rows[1].excluded).toBe(false)
    expect(rows[2].excluded).toBe(true)

    await user.click(screen.getByTestId('submit-button'))

    expect(onSubmitMock).toHaveBeenCalledTimes(1)
    const payload = onSubmitMock.mock.calls[0][0]
    expect(payload.accountId).toBe('acc-1')
    expect(payload.rows).toHaveLength(1)
    expect(payload.rows[0]).toMatchObject({ payee: 'Opening balance', amount: 100, type: 'expense' })
    // date converted at the payload boundary via local parts, never new Date(raw)
    const date: Date = payload.rows[0].date
    expect(date.getFullYear()).toBe(2024)
    expect(date.getMonth()).toBe(0)
    expect(date.getDate()).toBe(25)
  })

  it('shows the per-row report on failure and retries with the unchanged payload (CSV-IMP-10)', async () => {
    const user = userEvent.setup()
    onSubmitMock.mockResolvedValueOnce({
      success: false,
      errors: [{ rowIndex: 0, field: 'payee', reason: 'Payee is required' }],
    })
    render(<ReviewImportTable onBack={vi.fn()} onSubmit={onSubmitMock} />)

    await user.click(screen.getByTestId('submit-button'))

    expect(await screen.findByTestId('import-report')).toBeTruthy()
    // report row number displayed as +1
    expect(screen.getByText(/import.report_row/).textContent).toContain('"row":1')

    await user.click(screen.getByTestId('retry-button'))
    await waitFor(() => expect(onSubmitMock).toHaveBeenCalledTimes(2))
    // retry re-submits the same payload
    expect(onSubmitMock.mock.calls[1][0]).toEqual(onSubmitMock.mock.calls[0][0])
  })

  it('disables the submit control and shows a loading state during submit (CSV-IMP-10)', async () => {
    const user = userEvent.setup()
    let resolveSubmit: (value: { success: boolean }) => void = () => {}
    onSubmitMock.mockReturnValueOnce(new Promise(resolve => { resolveSubmit = resolve }))

    render(<ReviewImportTable onBack={vi.fn()} onSubmit={onSubmitMock} />)

    const submitButton = screen.getByTestId('submit-button') as HTMLButtonElement
    await user.click(submitButton)

    expect(submitButton.disabled).toBe(true)
    expect(screen.getByText('import.submitting')).toBeTruthy()

    resolveSubmit({ success: true })
    await waitFor(() => expect(submitButton.disabled).toBe(false))
  })
})
