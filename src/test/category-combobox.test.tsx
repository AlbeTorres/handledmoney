import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CategoryCombobox } from '@/components/budget-plan/CategoryCombobox'

describe('CategoryCombobox', () => {
  it('offers every compatible owned category without a reuse prohibition', () => {
    const onSelect = vi.fn()
    render(<CategoryCombobox
      categories={[
        { id: 'income-1', name: 'Salary', type: 'income', icon: 'wallet', color: '137FEC' },
        { id: 'expense-1', name: 'Food', type: 'expense', icon: 'utensils', color: '137FEC' },
      ]}
      calculationType='income'
      selectedCategoryId=''
      onSelect={onSelect}
      onCreate={vi.fn()}
    />)

    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.queryByText('Food')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Salary'))
    expect(onSelect).toHaveBeenCalledWith('income-1')
  })

  it('communicates an empty compatible selector and retains quick creation', () => {
    const onCreate = vi.fn()
    render(<CategoryCombobox categories={[]} calculationType='outflow' selectedCategoryId='' onSelect={vi.fn()} onCreate={onCreate} />)
    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByText('No compatible categories found.')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Create category'))
    expect(onCreate).toHaveBeenCalledOnce()
  })
})
