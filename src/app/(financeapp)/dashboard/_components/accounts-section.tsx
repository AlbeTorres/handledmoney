import { presentDashboardAccounts } from '@/lib/dashboard/account-presentation'
import type { DashboardAccount } from '@/lib/dashboard/accounts'
import type { SourceResult } from '@/lib/dashboard/source-result'
import { AccountsWidget } from './accounts-widget'
import { SectionUnavailable } from './section-unavailable'

interface Props {
  accounts: Promise<SourceResult<DashboardAccount[]>>
}

/**
 * Server section that presents the page-created accounts source through the
 * account-widget contract (validated types + single-currency aggregate). Empty
 * and mixed-currency sets yield `null` aggregates — never fabricated totals.
 */
export async function AccountsSection({ accounts }: Props) {
  const accountsResult = await accounts
  if (!accountsResult.ok) {
    return <SectionUnavailable />
  }
  const { accounts: presented, aggregateBalance } = presentDashboardAccounts(accountsResult.data)
  return <AccountsWidget accounts={presented} aggregateBalance={aggregateBalance} />
}