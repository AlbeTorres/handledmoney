export function DashboardFooter() {
  return (
    <footer className='mt-auto flex flex-col items-center justify-between gap-4 border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6 md:flex-row lg:px-8'>
      <p>© {new Date().getFullYear()} HandledMoney. All rights reserved.</p>
      <div className='flex items-center gap-6'>
        <a
          className='rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring'
          href='/privacy'
        >
          Privacy Policy
        </a>
        <a
          className='rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring'
          href='/terms'
        >
          Terms of Service
        </a>
      </div>
    </footer>
  )
}
