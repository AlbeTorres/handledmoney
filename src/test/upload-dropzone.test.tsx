import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCSVState } from '@/store/CSVState'
import { MAX_IMPORT_ROWS } from '@/lib/csv/constants'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { toastErrorMock, toastSuccessMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}))

// The CSVReader mock holds the next parse result; the trigger button's click
// fires onUploadAccepted with it (mirrors react-papaparse's file-drop flow).
const csvMock = vi.hoisted(() => ({
  results: null as unknown,
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

vi.mock('react-papaparse', () => ({
  useCSVReader: () => ({
    CSVReader: ({
      onUploadAccepted,
      children,
    }: {
      onUploadAccepted: (results: unknown) => void
      children: (props: {
        getRootProps: (opts?: {
          onDragEnter?: () => void
          onDragLeave?: () => void
          onDrop?: () => void
        }) => Record<string, unknown>
      }) => React.ReactNode
    }) =>
      children({
        getRootProps: (opts = {}) => ({
          onClick: () => onUploadAccepted(csvMock.results),
          onDragEnter: opts.onDragEnter,
          onDragLeave: opts.onDragLeave,
          onDrop: opts.onDrop,
        }),
      }),
  }),
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { UploadDropzone } from '@/components/UploadDropzone'

// ── Helpers ────────────────────────────────────────────────────────────────────

const EMPTY_META = {
  delimiter: '',
  linebreak: '',
  aborted: false,
  truncated: false,
  cursor: 0,
}

const makeResult = (data: string[][], errors: unknown[] = []) => ({
  data,
  errors,
  meta: EMPTY_META,
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('UploadDropzone', () => {
  beforeEach(() => {
    toastErrorMock.mockClear()
    toastSuccessMock.mockClear()
    useCSVState.setState({
      isImporting: 'LIST',
      importResult: { data: [], errors: [], meta: EMPTY_META },
    })
  })

  it('parses a file, cleans rows, and transitions to IMPORT (CSV-IMP-07)', async () => {
    const user = userEvent.setup()
    csvMock.results = makeResult([
      ['Date', 'Description', 'Amount', '', ''],
      ['1/24/2024', 'Rebtel', '$3.49', '', ''],
      ['1/25/2024', 'Opening balance', '$100.00', '', ''],
    ])

    render(<UploadDropzone />)
    await user.click(screen.getByRole('button'))

    const state = useCSVState.getState()
    expect(state.isImporting).toBe('IMPORT')
    // trailing empty columns filtered, fully empty rows dropped (defect 11)
    expect(state.importResult.data).toEqual([
      ['Date', 'Description', 'Amount'],
      ['1/24/2024', 'Rebtel', '$3.49'],
      ['1/25/2024', 'Opening balance', '$100.00'],
    ])
    expect(toastErrorMock).not.toHaveBeenCalled()
  })

  it('surfaces papaparse errors with a toast and does not proceed (CSV-IMP-07)', async () => {
    const user = userEvent.setup()
    csvMock.results = makeResult([['Date', 'Amount']], [
      { type: 'Quotes', code: 'Quotes', message: 'Unescaped quote', row: 2 },
    ])

    render(<UploadDropzone />)
    await user.click(screen.getByRole('button'))

    expect(toastErrorMock).toHaveBeenCalledWith('import.upload_parse_error')
    expect(useCSVState.getState().isImporting).toBe('LIST')
  })

  it('rejects files over MAX_IMPORT_ROWS with a toast (D8)', async () => {
    const user = userEvent.setup()
    const rows: string[][] = [['Date', 'Amount']]
    for (let i = 0; i < MAX_IMPORT_ROWS + 1; i++) {
      rows.push([`1/${(i % 27) + 1}/2024`, `${i}.00`])
    }
    csvMock.results = makeResult(rows)

    render(<UploadDropzone />)
    await user.click(screen.getByRole('button'))

    expect(toastErrorMock).toHaveBeenCalledWith(
      `import.upload_too_many_rows:${JSON.stringify({ max: MAX_IMPORT_ROWS })}`,
    )
    expect(useCSVState.getState().isImporting).toBe('LIST')
  })

  it('accepts a file with exactly MAX_IMPORT_ROWS data rows (D8 boundary)', async () => {
    const user = userEvent.setup()
    const rows: string[][] = [['Date', 'Amount']]
    for (let i = 0; i < MAX_IMPORT_ROWS; i++) {
      rows.push([`1/${(i % 27) + 1}/2024`, `${i}.00`])
    }
    csvMock.results = makeResult(rows)

    render(<UploadDropzone />)
    await user.click(screen.getByRole('button'))

    expect(toastErrorMock).not.toHaveBeenCalled()
    expect(useCSVState.getState().isImporting).toBe('IMPORT')
  })

  it('highlights the dropzone while dragging and clears it on leave', () => {
    render(<UploadDropzone />)

    // Re-query after each event: the dropzone node can be reconciled into a
    // fresh element on re-render, so a stale reference would miss the update.
    const getDropzone = () => screen.getByTestId('upload-dropzone')
    expect(getDropzone()).toHaveAttribute('data-dragging', 'false')

    fireEvent.dragEnter(getDropzone())
    expect(getDropzone()).toHaveAttribute('data-dragging', 'true')

    fireEvent.dragLeave(getDropzone())
    expect(getDropzone()).toHaveAttribute('data-dragging', 'false')
  })
})
