export function SupportBox() {
  return (
    <div className='p-4'>
      <div className='bg-primary/10 rounded-xl p-4 border border-primary/20'>
        <p className='text-xs font-semibold text-primary uppercase tracking-wider mb-2'>Support</p>
        <p className='text-xs text-slate-600 dark:text-slate-400 mb-3'>
          Need help with your accounts?
        </p>
        <button className='w-full py-2 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none'>
          Contact Us
        </button>
      </div>
    </div>
  )
}
