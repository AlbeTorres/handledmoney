export function DashboardFooter() {
  return (
    <footer className='mt-auto p-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400'>
      <p>© 2024 FintechPro Banking Solutions. All rights reserved.</p>
      <div className='flex items-center gap-6'>
        <a
          className='hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded'
          href='/privacy'
        >
          Privacy Policy
        </a>
        <a
          className='hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded'
          href='#'
        >
          Terms of Service
        </a>
        <a
          className='hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded'
          href='#'
        >
          Security Center
        </a>
      </div>
    </footer>
  )
}
