import type { AggregateBalance, DashboardAccount, SupportedAccountType } from './accounts'

const SUPPORTED_ACCOUNT_TYPES = new Set<SupportedAccountType>([
  'savings',
  'checking',
  'investment',
  'credit',
  'cash',
])

/**
 * Raw account-type validation used by the account widget only. Any value that
 * is not one of the five supported literals is presented generically rather
 * than typed.
 */
export function isSupportedAccountType(value: string): value is SupportedAccountType {
  return SUPPORTED_ACCOUNT_TYPES.has(value as SupportedAccountType)
}

/**
 * Account row after account-widget-only presentation. `type` is the validated
 * literal or `null` for unknown raw types; `presentation` tells the widget
 * whether the type can drive iconography.
 */
export type PresentedAccount = {
  id: string
  name: string
  type: SupportedAccountType | null
  presentation: 'typed' | 'generic'
  currency: string
  balance: number
}

/**
 * Account widget payload: presented accounts plus the aggregate balance.
 * `aggregateBalance` is `null` for empty or mixed-currency sets; no currency
 * conversion is ever performed (USD-only MVP).
 */
export type AccountWidgetData = {
  accounts: PresentedAccount[]
  aggregateBalance: AggregateBalance | null
}

function requireFinite(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Account presentation received a non-finite ${label}`)
  }
  return value
}

/**
 * Pure account-widget projection: validates raw account types and computes
 * the single-currency aggregate balance. Empty sets and mixed currencies
 * yield `null` aggregates, never fabricated totals.
 */
export function presentDashboardAccounts(accounts: DashboardAccount[]): AccountWidgetData {
  const presented = accounts.map(account => {
    const balance = requireFinite(account.balance, `balance for ${account.name}`)
    const type = isSupportedAccountType(account.type) ? account.type : null
    return {
      id: account.id,
      name: account.name,
      type,
      presentation: type === null ? ('generic' as const) : ('typed' as const),
      currency: account.currency,
      balance,
    }
  })

  const currencies = new Set(presented.map(account => account.currency))
  const aggregateBalance: AggregateBalance | null =
    presented.length > 0 && currencies.size === 1
      ? {
          currency: presented[0].currency,
          balance: presented.reduce((sum, account) => sum + account.balance, 0),
        }
      : null

  return { accounts: presented, aggregateBalance }
}
