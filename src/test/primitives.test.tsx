import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

describe('Button variants (token contract)', () => {
  it('renders the default variant with semantic primary tokens and no aggressive motion', () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.className).toContain('bg-primary')
    expect(button.className).toContain('text-primary-foreground')
    expect(button.className).not.toContain('hover:scale-105')
    expect(button.className).not.toContain('transition-all')
  })

  it('renders the destructive variant with the destructive foreground token', () => {
    render(<Button variant='destructive'>Delete</Button>)
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button.className).toContain('bg-destructive')
    expect(button.className).toContain('text-destructive-foreground')
    expect(button.className).not.toContain('text-white')
  })

  it('keeps disabled state and focus-visible affordances', () => {
    render(<Button disabled>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.className).toContain('disabled:opacity-50')
    expect(button.className).toContain('focus-visible:ring-')
  })
})

describe('Badge variants (token contract)', () => {
  it('renders the success variant with the success tint and text token', () => {
    render(<Badge variant='success'>Income</Badge>)
    const badge = screen.getByText('Income')
    expect(badge.className).toContain('bg-success/15')
    expect(badge.className).toContain('text-success')
  })

  it('renders the warning variant with the warning tint and text token', () => {
    render(<Badge variant='warning'>Over budget</Badge>)
    const badge = screen.getByText('Over budget')
    expect(badge.className).toContain('bg-warning/15')
    expect(badge.className).toContain('text-warning')
  })

  it('renders the destructive variant with the destructive foreground token', () => {
    render(<Badge variant='destructive'>Overdue</Badge>)
    const badge = screen.getByText('Overdue')
    expect(badge.className).toContain('bg-destructive')
    expect(badge.className).toContain('text-destructive-foreground')
  })
})
