import { LucideInfo, LucideSettings } from 'lucide-react'

export default function PreferencesSettings() {
  return (
    <div className='bg-white shadow-sm p-6 rounded-xl flex flex-col gap-5 md:col-span-2'>
      <div className='flex items-center gap-2 mb-base'>
        <LucideSettings size={20} />
        <h3 className='font-bold text-foreground'>System Preferences</h3>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
        <div className='flex flex-col gap-1'>
          <label className='font-label-caps text-on-surface-variant'>DISPLAY LANGUAGE</label>
          <select className='w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-lg bg-surface appearance-none cursor-pointer input-focus-ring'>
            <option>English (US)</option>
            <option>Spanish (ES)</option>
            <option>French (FR)</option>
            <option>German (DE)</option>
          </select>
        </div>
        <div className='flex flex-col gap-1'>
          <label className='font-label-caps text-on-surface-variant'>TIMEZONE</label>
          <select className='w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-lg bg-surface appearance-none cursor-pointer input-focus-ring'>
            <option>(GMT-08:00) Pacific Time</option>
            <option>(GMT-05:00) Eastern Time</option>
            <option>(GMT+00:00) UTC</option>
            <option>(GMT+01:00) Central European Time</option>
          </select>
        </div>
        <div className='flex flex-col gap-1'>
          <label className='font-label-caps text-on-surface-variant'>CURRENCY FORMAT</label>
          <select className='w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-lg bg-surface appearance-none cursor-pointer input-focus-ring'>
            <option>$1,234.56 (USD)</option>
            <option>1.234,56 € (EUR)</option>
            <option>£1,234.56 (GBP)</option>
            <option>¥123,456 (JPY)</option>
          </select>
        </div>
      </div>
      <div className='mt-2 p-2 bg-secondary/5 rounded-lg border border-secondary/20 flex items-start gap-3'>
        <LucideInfo size={20} className='text-secondary mt-1' />
        <p className='text-primary font-semibold'>
          Changing these preferences will update your dashboard and report views immediately.
          Historical data formatting will remain consistent with your organizational standards.
        </p>
      </div>
    </div>
  )
}
