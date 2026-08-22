import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, number>) =>
    key === 'step_count' ? `Step ${params?.current} of ${params?.total}` : key,
}))

import { BudgetCreationStepper } from '@/app/(financeapp)/budget/_components/BudgetCreationStepper'

function stepItem(label: string) {
  const item = screen.getByText(label).closest('li')
  if (!item) throw new Error(`Expected a <li> wrapping the "${label}" label`)
  return item as HTMLLIElement
}

function nav() {
  return screen.getByRole('navigation', { name: 'steps_label' })
}

describe('BudgetCreationStepper', () => {
  it('renders the three steps with their labels inside a labelled navigation', () => {
    render(<BudgetCreationStepper currentStep='setup' />)

    expect(within(nav()).getByText('step_setup')).toBeInTheDocument()
    expect(within(nav()).getByText('step_structure')).toBeInTheDocument()
    expect(within(nav()).getByText('step_allocation')).toBeInTheDocument()
  })

  it('marks only the active step with aria-current on the setup step initially', () => {
    render(<BudgetCreationStepper currentStep='setup' />)

    expect(stepItem('step_setup')).toHaveAttribute('aria-current', 'step')
    expect(stepItem('step_structure')).not.toHaveAttribute('aria-current')
    expect(stepItem('step_allocation')).not.toHaveAttribute('aria-current')
  })

  it('moves the active step and styles earlier steps as completed as currentStep advances', () => {
    const { rerender } = render(<BudgetCreationStepper currentStep='setup' />)

    rerender(<BudgetCreationStepper currentStep='structure' />)

    expect(stepItem('step_structure')).toHaveAttribute('aria-current', 'step')
    expect(stepItem('step_setup')).not.toHaveAttribute('aria-current')
    expect(stepItem('step_setup').querySelector('div')).toHaveClass('bg-primary')
    expect(stepItem('step_setup').querySelector('span')).toHaveClass('text-foreground')
    expect(stepItem('step_structure').querySelector('div')).toHaveClass('bg-primary')
    expect(stepItem('step_structure').querySelector('span')).toHaveClass(
      'text-primary',
      'font-semibold',
    )
    expect(stepItem('step_allocation').querySelector('div')).toHaveClass('bg-muted')
    expect(stepItem('step_allocation').querySelector('span')).toHaveClass('text-muted-foreground')

    rerender(<BudgetCreationStepper currentStep='allocation' />)

    expect(stepItem('step_allocation')).toHaveAttribute('aria-current', 'step')
    expect(stepItem('step_setup').querySelector('div')).toHaveClass('bg-primary')
    expect(stepItem('step_setup').querySelector('span')).toHaveClass('text-foreground')
    expect(stepItem('step_structure').querySelector('div')).toHaveClass('bg-primary')
    expect(stepItem('step_structure').querySelector('span')).toHaveClass('text-foreground')
  })

  it('is not interactive: no buttons or links exist and clicking a label does nothing', async () => {
    const user = userEvent.setup()
    render(<BudgetCreationStepper currentStep='setup' />)

    expect(within(nav()).queryByRole('button')).toBeNull()
    expect(within(nav()).queryByRole('link')).toBeNull()

    await user.click(screen.getByText('step_allocation'))

    expect(stepItem('step_setup')).toHaveAttribute('aria-current', 'step')
    expect(stepItem('step_allocation')).not.toHaveAttribute('aria-current')
  })

  it('shows the step counter caption with the current and total params', () => {
    const { rerender } = render(<BudgetCreationStepper currentStep='setup' />)

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()

    rerender(<BudgetCreationStepper currentStep='structure' />)
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()

    rerender(<BudgetCreationStepper currentStep='allocation' />)
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
  })
})
