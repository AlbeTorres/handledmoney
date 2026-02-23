import { auth } from '@/lib/auth'
import {
  Bell,
  Bitcoin,
  Briefcase,
  CreditCard,
  LandmarkIcon,
  PiggyBank,
  PlusIcon,
  Search,
  ShoppingCart,
  TrendingUp,
  Utensils,
} from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect('/auth/login')
  }
  return (
    <section className='flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark/50'>
      {/* <!-- Header --> */}
      <header className='sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'>
        <div className='flex items-center gap-8'>
          <h2 className='text-xl font-bold tracking-tight'>Accounts Overview</h2>
          <div className='hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700'>
            <Search />
            <input
              className='bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-slate-500'
              placeholder='Search accounts...'
              type='text'
            />
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20'>
            <PlusIcon />
            <span>Add Account</span>
          </button>
          <button className='p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative'>
            <Bell />
            <span className='absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark'></span>
          </button>
          <div className='size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600'>
            <img
              alt='User Profile'
              className='w-full h-full object-cover'
              data-alt='Avatar of the user profile'
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuCGAkh_-hc2v1q_xuNc5SC06Ey4Wv6XEP4wVhxcqHN-kPzBiH2--B3MjVkyEmIOP1zo0EsqZsKQO_7BqYQ5e9A8jDUIr1jaBqIPOIULOxIgWFH68NOB89ymo3zHXsDB8-_tXI9Iy1djpPRLFHhkeA52lAJVaIwuUGSdb0HfdN8KVsuwTvYqu7DqLArFQgNTFXdKnu5u8Q7C37U7p5QeBp0l_qfxUirtRIzqYzxD8y1C2qikwozAu9zMpiRLoKBhll1V-MAU_zBd_I8k'
            />
          </div>
        </div>
      </header>
      <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
        {/* <!-- Summary Stats --> */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
            <div className='flex justify-between items-start mb-4'>
              <span className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                Total Net Worth
              </span>
              <span className='px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-500'>
                +2.4%
              </span>
            </div>
            <h3 className='text-3xl font-extrabold tracking-tight'>$45,230.50</h3>
            <p className='text-xs text-slate-400 mt-2 flex items-center gap-1'>
              <TrendingUp />
              Increased by $1,050 this month
            </p>
          </div>
          <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
            <div className='flex justify-between items-start mb-4'>
              <span className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                Total Assets
              </span>
              <span className='px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-500'>
                +1.8%
              </span>
            </div>
            <h3 className='text-3xl font-extrabold tracking-tight'>$52,400.00</h3>
            <p className='text-xs text-slate-400 mt-2'>Aggregated across 8 accounts</p>
          </div>
          <div className='bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
            <div className='flex justify-between items-start mb-4'>
              <span className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                Total Liabilities
              </span>
              <span className='px-2 py-0.5 rounded text-xs font-bold bg-rose-500/10 text-rose-500'>
                -0.5%
              </span>
            </div>
            <h3 className='text-3xl font-extrabold tracking-tight'>-$7,169.50</h3>
            <p className='text-xs text-slate-400 mt-2'>Credit cards and loans</p>
          </div>
        </div>
        {/* <!-- Filters & Tabs --> */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <div className='flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg'>
            <button className='px-4 py-1.5 rounded-md text-sm font-bold bg-white dark:bg-slate-700 shadow-sm transition-all'>
              All Accounts
            </button>
            <button className='px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all'>
              USD
            </button>
            <button className='px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all'>
              EUR
            </button>
            <button className='px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all'>
              Crypto
            </button>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-slate-500 dark:text-slate-400 font-medium'>Sort by:</span>
            <select className='bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer'>
              <option>Highest Balance</option>
              <option>Account Name</option>
              <option>Recently Added</option>
            </select>
          </div>
        </div>
        {/* <!-- Account Grid --> */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* <!-- Account Card 1 --> */}
          <div className='group bg-white dark:bg-slate-900 rounded-xl border-l-4 border-l-primary border-y border-r border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer'>
            <div className='flex justify-between items-start mb-6'>
              <div className='size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <LandmarkIcon />
              </div>
              <button className='text-slate-400 hover:text-primary transition-colors'>
                <span className='material-symbols-outlined'>more_vert</span>
              </button>
            </div>
            <div>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>
                Chase Bank
              </p>
              <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>
                Sapphire Checking
              </h4>
              <div className='flex items-baseline gap-1'>
                <span className='text-2xl font-extrabold'>$12,450</span>
                <span className='text-sm font-bold text-slate-400'>.00</span>
                <span className='text-xs font-medium text-slate-400 ml-1'>USD</span>
              </div>
            </div>
            <div className='mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center'>
              <span className='text-xs font-medium text-slate-400'>**** 4492</span>
              <span className='text-xs font-bold text-emerald-500 flex items-center gap-1'>
                <span className='size-1.5 bg-emerald-500 rounded-full'></span> Active
              </span>
            </div>
          </div>
          {/* <!-- Account Card 2 --> */}
          <div className='group bg-white dark:bg-slate-900 rounded-xl border-l-4 border-l-emerald-500 border-y border-r border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer'>
            <div className='flex justify-between items-start mb-6'>
              <div className='size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500'>
                <PiggyBank />
              </div>
              <button className='text-slate-400 hover:text-emerald-500 transition-colors'>
                <span className='material-symbols-outlined'>more_vert</span>
              </button>
            </div>
            <div>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>
                Revolut Ltd
              </p>
              <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>
                Personal Savings
              </h4>
              <div className='flex items-baseline gap-1'>
                <span className='text-2xl font-extrabold'>€5,200</span>
                <span className='text-sm font-bold text-slate-400'>.50</span>
                <span className='text-xs font-medium text-slate-400 ml-1'>EUR</span>
              </div>
            </div>
            <div className='mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center'>
              <span className='text-xs font-medium text-slate-400'>revolut.me/user</span>
              <span className='text-xs font-bold text-emerald-500 flex items-center gap-1'>
                <span className='size-1.5 bg-emerald-500 rounded-full'></span> Active
              </span>
            </div>
          </div>
          {/* <!-- Account Card 3 --> */}
          <div className='group bg-white dark:bg-slate-900 rounded-xl border-l-4 border-l-amber-500 border-y border-r border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-amber-500/5 transition-all cursor-pointer'>
            <div className='flex justify-between items-start mb-6'>
              <div className='size-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500'>
                <Bitcoin />
              </div>
              <button className='text-slate-400 hover:text-amber-500 transition-colors'>
                <span className='material-symbols-outlined'>more_vert</span>
              </button>
            </div>
            <div>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>
                Binance Exchange
              </p>
              <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>
                Trading Wallet
              </h4>
              <div className='flex items-baseline gap-1'>
                <span className='text-2xl font-extrabold'>0.4582</span>
                <span className='text-xs font-medium text-slate-400 ml-1'>BTC</span>
              </div>
            </div>
            <div className='mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center'>
              <span className='text-xs font-medium text-slate-400'>≈ $28,940.12 USD</span>
              <span className='text-xs font-bold text-emerald-500 flex items-center gap-1'>
                <span className='size-1.5 bg-emerald-500 rounded-full'></span> Live
              </span>
            </div>
          </div>
          {/* <!-- Account Card 4 --> */}
          <div className='group bg-white dark:bg-slate-900 rounded-xl border-l-4 border-l-indigo-500 border-y border-r border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer'>
            <div className='flex justify-between items-start mb-6'>
              <div className='size-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500'>
                <CreditCard />
              </div>
              <button className='text-slate-400 hover:text-indigo-500 transition-colors'>
                <span className='material-symbols-outlined'>more_vert</span>
              </button>
            </div>
            <div>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>
                American Express
              </p>
              <h4 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>Gold Card</h4>
              <div className='flex items-baseline gap-1'>
                <span className='text-2xl font-extrabold'>-$2,145</span>
                <span className='text-sm font-bold text-slate-400'>.20</span>
                <span className='text-xs font-medium text-slate-400 ml-1'>USD</span>
              </div>
            </div>
            <div className='mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center'>
              <span className='text-xs font-medium text-slate-400'>Pay by Jun 15</span>
              <span className='text-xs font-bold text-amber-500 flex items-center gap-1'>
                <span className='size-1.5 bg-amber-500 rounded-full'></span> Payment Due
              </span>
            </div>
          </div>
          {/* <!-- Add New Card Placeholder --> */}
          <button className='group bg-slate-100/50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 min-h-[220px]'>
            <div className='size-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all'>
              <PlusIcon />
            </div>
            <div className='text-center'>
              <p className='font-bold text-slate-600 dark:text-slate-300'>Add New Account</p>
              <p className='text-xs text-slate-400'>Connect a bank or wallet</p>
            </div>
          </button>
        </div>
        {/* <!-- Recent Activity Table --> */}
        <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden'>
          <div className='p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center'>
            <h3 className='font-bold text-lg'>Recent Transactions</h3>
            <a className='text-sm font-bold text-primary hover:underline' href='#'>
              View All
            </a>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead>
                <tr className='bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider'>
                  <th className='px-6 py-4'>Entity</th>
                  <th className='px-6 py-4'>Account</th>
                  <th className='px-6 py-4'>Date</th>
                  <th className='px-6 py-4 text-right'>Amount</th>
                  <th className='px-6 py-4 text-center'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
                <tr className='hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors'>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center'>
                        <ShoppingCart />
                      </div>
                      <span className='text-sm font-bold'>Apple Store</span>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-slate-500 dark:text-slate-400'>
                    Sapphire Checking
                  </td>
                  <td className='px-6 py-4 text-sm text-slate-500 dark:text-slate-400'>
                    May 24, 2024
                  </td>
                  <td className='px-6 py-4 text-right text-sm font-bold text-rose-500'>
                    -$1,299.00
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex justify-center'>
                      <span className='px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase'>
                        Completed
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className='hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors'>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center'>
                        <Briefcase />
                      </div>
                      <span className='text-sm font-bold'>Initech Corp</span>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-slate-500 dark:text-slate-400'>
                    Sapphire Checking
                  </td>
                  <td className='px-6 py-4 text-sm text-slate-500 dark:text-slate-400'>
                    May 22, 2024
                  </td>
                  <td className='px-6 py-4 text-right text-sm font-bold text-emerald-500'>
                    +$4,500.00
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex justify-center'>
                      <span className='px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase'>
                        Completed
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className='hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors'>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center'>
                        <Utensils />
                      </div>
                      <span className='text-sm font-bold'>Starbucks Coffee</span>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-slate-500 dark:text-slate-400'>
                    Gold Card
                  </td>
                  <td className='px-6 py-4 text-sm text-slate-500 dark:text-slate-400'>
                    May 21, 2024
                  </td>
                  <td className='px-6 py-4 text-right text-sm font-bold text-rose-500'>-$12.45</td>
                  <td className='px-6 py-4'>
                    <div className='flex justify-center'>
                      <span className='px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase'>
                        Pending
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* <!-- Footer --> */}
      <footer className='mt-auto p-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400'>
        <p>© 2024 FintechPro Banking Solutions. All rights reserved.</p>
        <div className='flex items-center gap-6'>
          <a className='hover:text-primary transition-colors' href='#'>
            Privacy Policy
          </a>
          <a className='hover:text-primary transition-colors' href='#'>
            Terms of Service
          </a>
          <a className='hover:text-primary transition-colors' href='#'>
            Security Center
          </a>
        </div>
      </footer>
    </section>
  )
}
