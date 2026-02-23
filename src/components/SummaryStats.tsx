import { StatCard } from './StatCard'

export function SummaryStats() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      <StatCard
        label='Total Net Worth'
        value='$45,230.50'
        badge='+2.4%'
        footer='Increased by $1,050 this month'
      />
      <StatCard
        label='Total Assets'
        value='$52,400.00'
        badge='+1.8%'
        footer='Aggregated across 8 accounts'
      />
      <StatCard
        label='Total Liabilities'
        value='-$7,169.50'
        badge='-0.5%'
        badgeVariant='negative'
        footer='Credit cards and loans'
      />
    </div>
  )
}
