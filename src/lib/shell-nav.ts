/**
 * Pure helpers for the authenticated application shell: route titles and
 * active-route matching. Kept free of React so they are trivially testable.
 */

const TITLES = {
  root: 'Dashboard',
  dashboard: 'Dashboard',
  accounts: 'Accounts',
  newAccount: 'New Account',
  accountDetails: 'Account Details',
  editAccount: 'Edit Account',
  categories: 'Categories',
  newCategory: 'New Category',
  categoryDetails: 'Category Details',
  editCategory: 'Edit Category',
  transactions: 'Transactions',
  newTransaction: 'New Transaction',
  bulkImport: 'Bulk Import',
  transactionDetails: 'Transaction Details',
  editTransaction: 'Edit Transaction',
  budget: 'Budget',
  newBudget: 'New Budget',
  budgetDetails: 'Budget Details',
  settings: 'Settings',
} as const

function capitalize(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

/**
 * Maps a pathname to the header title.
 *
 * Create/detail/edit paths get specific titles; the first segment drives
 * area-level fallbacks (e.g. unknown areas render their capitalized name).
 */
export function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  const [area, sub, third] = segments

  switch (area) {
    case undefined:
    case 'dashboard':
      return TITLES.dashboard
    case 'account':
      if (sub === 'create') return TITLES.newAccount
      if (third === 'edit') return TITLES.editAccount
      if (sub) return TITLES.accountDetails
      return TITLES.accounts
    case 'category':
      if (sub === 'create') return TITLES.newCategory
      if (third === 'edit') return TITLES.editCategory
      if (sub) return TITLES.categoryDetails
      return TITLES.categories
    case 'transaction':
      if (sub === 'create') return TITLES.newTransaction
      if (sub === 'bulk') return TITLES.bulkImport
      if (third === 'edit') return TITLES.editTransaction
      if (sub) return TITLES.transactionDetails
      return TITLES.transactions
    case 'budget':
      if (sub === 'create') return TITLES.newBudget
      if (sub) return TITLES.budgetDetails
      return TITLES.budget
    case 'settings':
      return TITLES.settings
    default:
      return capitalize(area)
  }
}

/**
 * Segment-aware active matching for sidebar navigation.
 *
 * A nav item is active when the pathname equals its href or continues it at a
 * segment boundary, so nested routes stay highlighted while `/account` never
 * matches `/accounting`.
 */
export function isRouteActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
