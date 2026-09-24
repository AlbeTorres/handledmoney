import { Card, CardContent } from '@/components/ui/card'
import { Landmark, ListChecks, WalletCards } from 'lucide-react'

const Feature = () => {
  return (
    <section className='border-y bg-muted/40 py-16 md:py-20'>
      <div className='container px-4 md:px-6'>
        <div className='max-w-2xl space-y-3'>
          <p className='label-caps text-primary'>Built around your records</p>
          <h2 className='headline-lg'>Tools for the financial information you choose to keep.</h2>
        </div>
        <div className='mt-10 grid gap-4 md:grid-cols-3'>
          <Card>
            <CardContent className='space-y-3 p-6'>
              <WalletCards className='size-6 text-primary' aria-hidden='true' />
              <h3 className='title-md'>Accounts</h3>
              <p className='body-sm text-muted-foreground'>
                Keep the accounts you add organized in one view.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='space-y-3 p-6'>
              <ListChecks className='size-6 text-primary' aria-hidden='true' />
              <h3 className='title-md'>Transactions</h3>
              <p className='body-sm text-muted-foreground'>
                Record and review the income and expenses you enter.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='space-y-3 p-6'>
              <Landmark className='size-6 text-primary' aria-hidden='true' />
              <h3 className='title-md'>Budgets</h3>
              <p className='body-sm text-muted-foreground'>
                Plan amounts by category and follow your recorded activity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Feature
