import type { DashboardAccount } from '@/interfaces/accounts'
import { presentDashboardAccounts } from '@/lib/dashboard/account-presentation'
import { AccountsWidget } from './accounts-widget'
import { SectionUnavailable } from './section-unavailable'

interface Props {
  accounts: Promise<{ data: DashboardAccount[]; success: boolean }>
}

/**
 * Server section that presents the page-created accounts source through the
 * account-widget contract (validated types + single-currency aggregate). Empty
 * and mixed-currency sets yield `null` aggregates — never fabricated totals.
 */
export async function AccountsSection({ accounts }: Props) {
  const accountsResult = await accounts
  if (!accountsResult.success) {
    return <SectionUnavailable />
  }
  const { accounts: presented, aggregateBalance } = presentDashboardAccounts(accountsResult.data)
  return <AccountsWidget accounts={presented} aggregateBalance={aggregateBalance} />
}
