import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const dashboardComponents = resolve(process.cwd(), 'src/app/(financeapp)/dashboard/_components')
const projectRoot = process.cwd()

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
    expect(page).toContain('getDashboardActuals')
    expect(page).not.toContain('getDashboardData')
  })

  it('retires the legacy dashboard read path (action, repository, finance-data seam)', () => {
    for (const file of [
      'src/actions/dashboard/get-dashboard.ts',
      'src/repository/dashboard.ts',
      'src/lib/finance-data.ts',
    ]) {
      expect(existsSync(resolve(projectRoot, file))).toBe(false)
    }
  })
})
