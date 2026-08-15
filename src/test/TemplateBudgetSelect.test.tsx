import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const messages = {
  template_legend: 'Starting template',
  template_starter: 'Zero-Sum Starter',
  template_starter_description:
    'Creates the 6 editable groups (Income, Bills, Variable Expenses, Debt, Savings, Investments). Categories and amounts are configured in the next steps.',
  template_blank: 'Start blank',
  template_blank_description:
    'Only creates the mandatory income group. Other groups are added manually. No categories or amounts are created.',
}

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => messages[key as keyof typeof messages] ?? key,
}))

import TemplateBudgetSelect from '@/components/TemplateBudgetSelect'

function starterRadio() {
  return screen.getByRole('radio', { name: 'Zero-Sum Starter' })
}

function blankRadio() {
  return screen.getByRole('radio', { name: 'Start blank' })
}

function cardFor(radio: HTMLElement) {
  const card = radio.closest('label')
  if (!card) throw new Error('Expected the radio to be wrapped in a <label> card')
  return card as HTMLLabelElement
}

describe('TemplateBudgetSelect', () => {
  it('renders a fieldset with the legend and both template cards as native radios', () => {
    render(<TemplateBudgetSelect value='starter' onValueChange={() => {}} />)

    expect(screen.getByRole('group', { name: 'Starting template' })).toBeInTheDocument()
    expect(starterRadio()).toBeInTheDocument()
    expect(blankRadio()).toBeInTheDocument()
  })

  it('renders the starter card description listing the six editable groups and next steps', () => {
    render(<TemplateBudgetSelect value='starter' onValueChange={() => {}} />)

    expect(screen.getByText(messages.template_starter_description)).toBeInTheDocument()
  })

  it('renders the blank card description stating only the mandatory Income group is created', () => {
    render(<TemplateBudgetSelect value='starter' onValueChange={() => {}} />)

    expect(screen.getByText(messages.template_blank_description)).toBeInTheDocument()
  })

  it('marks the selected card with primary styling, a focus ring, and a circular check indicator', () => {
    render(<TemplateBudgetSelect value='starter' onValueChange={() => {}} />)

    expect(starterRadio()).toBeChecked()
    expect(cardFor(starterRadio())).toHaveClass('border-primary', 'bg-primary/5', 'focus-within:ring-2')
    expect(cardFor(starterRadio()).querySelector('.lucide-check')).not.toBeNull()

    expect(cardFor(blankRadio())).toHaveClass('border-border')
    expect(cardFor(blankRadio()).querySelector('.lucide-check')).toBeNull()
  })

  it('moves the selected styling when the controlled value changes', () => {
    const { rerender } = render(<TemplateBudgetSelect value='starter' onValueChange={() => {}} />)

    rerender(<TemplateBudgetSelect value='blank' onValueChange={() => {}} />)

    expect(blankRadio()).toBeChecked()
    expect(cardFor(blankRadio())).toHaveClass('border-primary', 'bg-primary/5')
    expect(cardFor(starterRadio())).toHaveClass('border-border')
  })

  it('calls onValueChange when a card is selected', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TemplateBudgetSelect value='starter' onValueChange={onValueChange} />)

    await user.click(screen.getByText('Start blank'))

    expect(onValueChange).toHaveBeenCalledWith('blank')
  })

  it('supports arrow-key navigation between the native radios', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TemplateBudgetSelect value='starter' onValueChange={onValueChange} />)

    starterRadio().focus()
    await user.keyboard('{ArrowDown}')

    expect(onValueChange).toHaveBeenCalledWith('blank')
  })

  it('disables the cards and blocks selection when disabled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TemplateBudgetSelect value='starter' onValueChange={onValueChange} disabled />)

    expect(starterRadio()).toBeDisabled()
    expect(blankRadio()).toBeDisabled()

    await user.click(screen.getByText('Start blank'))

    expect(onValueChange).not.toHaveBeenCalled()
  })
})
