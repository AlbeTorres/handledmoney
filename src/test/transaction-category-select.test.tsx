import { TransactionCategorySelect } from '@/components/TransactionCategorySelect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) =>
    ({
      category: 'Category',
      category_placeholder: 'Select a category',
      category_search: 'Search categories...',
      category_empty: 'No categories are available.',
      category_no_results: 'No categories match your search.',
      category_clear: 'Clear category',
    })[key] ?? key,
}))

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  PopoverTrigger: ({ children }: React.PropsWithChildren) => <>{children}</>,
  PopoverContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

describe('TransactionCategorySelect', () => {
  const categories = [
    { id: 'groceries', name: 'Groceries' },
    { id: 'salary', name: 'Salary' },
  ]

  it('shows the controlled initial value and clears it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TransactionCategorySelect
        id='category'
        value='salary'
        categories={categories}
        onValueChange={onValueChange}
      />,
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Salary')
    await user.click(screen.getByRole('button', { name: 'Clear category' }))
    expect(onValueChange).toHaveBeenCalledWith(undefined)
  })

  it('filters categories and supports keyboard selection', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TransactionCategorySelect
        id='category'
        categories={categories}
        onValueChange={onValueChange}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search categories...' }), 'gro')
    expect(screen.getByRole('option', { name: 'Groceries' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Salary' })).not.toBeInTheDocument()

    const option = screen.getByRole('option', { name: 'Groceries' })
    option.focus()
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('groceries')
  })

  it('announces empty and no-results states', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <TransactionCategorySelect id='category' categories={[]} onValueChange={vi.fn()} />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('No categories are available.')

    rerender(
      <TransactionCategorySelect id='category' categories={categories} onValueChange={vi.fn()} />,
    )
    await user.type(screen.getByRole('textbox', { name: 'Search categories...' }), 'utilities')
    expect(screen.getByRole('status')).toHaveTextContent('No categories match your search.')
  })
})
