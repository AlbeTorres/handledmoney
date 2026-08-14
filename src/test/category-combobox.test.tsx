import { CategoryCombobox } from '@/components/CategoryCombobox'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) =>
    ({
      category_placeholder: 'Select a category',
      category_search: 'Search categories...',
      category_empty: 'No compatible categories found.',
      create_category: 'Create category',
    })[key] ?? key,
}))

describe('CategoryCombobox', () => {
  it('offers every compatible owned category without a reuse prohibition', () => {
    const onSelect = vi.fn()
    render(
      <CategoryCombobox
        categories={[
          { id: 'income-1', name: 'Salary', type: 'income', icon: 'wallet', color: '137FEC' },
          { id: 'expense-1', name: 'Food', type: 'expense', icon: 'utensils', color: '137FEC' },
        ]}
        calculationType='income'
        selectedCategoryId=''
        onSelect={onSelect}
        onCreate={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.queryByText('Food')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Salary'))
    expect(onSelect).toHaveBeenCalledWith('income-1')
  })

  it('communicates an empty compatible selector and retains quick creation', () => {
    const onCreate = vi.fn()
    render(
      <CategoryCombobox
        categories={[]}
        calculationType='outflow'
        selectedCategoryId=''
        onSelect={vi.fn()}
        onCreate={onCreate}
      />,
    )
    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByText('No compatible categories found.')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Search categories...'), {
      target: { value: 'Groceries' },
    })
    fireEvent.click(screen.getByText('Create category'))
    expect(onCreate).toHaveBeenCalledOnce()
    expect(onCreate).toHaveBeenCalledWith('Groceries')
  })
})
