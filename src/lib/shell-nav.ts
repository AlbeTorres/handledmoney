const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  account: 'Accounts',
  category: 'Categories',
  transaction: 'Transactions',
  budget: 'Budgets',
  settings: 'Settings',
}

export function isRouteActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getPageTitle(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0]
  if (!segment) return 'Dashboard'
  const known = PAGE_TITLES[segment]
  if (known) return known
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}
