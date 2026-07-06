import { LucideShieldCheck } from 'lucide-react'

export default function TwoFASettings() {
  return (
    <div className='bg-white shadow-sm p-6 rounded-xl flex flex-col gap-5 md:col-span-2'>
      <div className='flex items-center gap-2 mb-base'>
        <LucideShieldCheck size={20} />
        <h3 className='font-bold text-foreground'>Two-Factor Authentication (2FA)</h3>
      </div>
      <p className=''>
        Add an extra layer of security to your account by requiring more than just a password to log
        in.
      </p>
      <div className='flex items-center justify-between px-4 py-3 bg-secondary/5 border border-secondary/20 rounded-lg'>
        <div className='flex items-center gap-2'>
          <span className='w-2.5 h-2.5 bg-secondary rounded-full'></span>
          <span className='font-body-lg font-bold text-on-surface'>Currently Enabled</span>
        </div>
        <span className='text-label-caps text-secondary font-bold'>SECURE</span>
      </div>
      <div className='pt-2'>
        <button className='w-full py-3 bg-primary text-white rounded-lg font-label-caps hover:bg-primary-container transition-all flex items-center justify-center gap-2'>
          <span className='material-symbols-outlined text-[18px]'>settings_authenticator</span>
          Manage 2FA Settings
        </button>
      </div>
    </div>
  )
}
