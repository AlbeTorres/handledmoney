import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const dashboardComponents = resolve(process.cwd(), 'src/app/(financeapp)/dashboard/_components')

describe('dashboard cleanup', () => {
  it('removes copied dashboard controls while retaining the finance-app page shell', () => {
    for (const file of [
      'add-transaction-dialog.tsx',
      'dashboard-header.tsx',
      'sidebar.tsx',
      'theme-toggle.tsx',
      'transaction-drawer.tsx',
    ]) {
      expect(existsSync(resolve(dashboardComponents, file))).toBe(false)
    }

    const page = readFileSync(resolve(process.cwd(), 'src/app/(financeapp)/dashboard/page.tsx'), 'utf8')
    expect(page).not.toMatch(/add-transaction-dialog|dashboard-header|transaction-drawer|theme-toggle|\.\/\_components\/sidebar/)
    expect(page).toContain('getDashboardData')
  })
})
