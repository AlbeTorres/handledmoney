import { LucideMail } from 'lucide-react'

export default function NotificationChannelSettings() {
  return (
    <div className='bg-white shadow-sm p-5 rounded-xl flex flex-col gap-2 md:col-span-2'>
      <div className='flex justify-between items-center mb-base'>
        <div className='flex items-center gap-2'>
          <LucideMail size={20} />
          <h3 className='font-bold text-foreground'>Notification Channels</h3>
        </div>
      </div>
      <div className='divide-y divide-outline-variant'>
        <div className='py-4 flex justify-between items-center'>
          <div>
            <p className='font-body-lg text-body-lg font-bold text-primary'>Balance Alerts</p>
            <p className='font-body-sm text-body-sm text-on-surface-variant'>
              Notify me when my balance falls below a threshold.
            </p>
          </div>
          <div className='relative inline-flex items-center cursor-pointer'>
            <input className='sr-only peer' type='checkbox' />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
          </div>
        </div>
        <div className='py-4 flex justify-between items-center'>
          <div>
            <p className='font-body-lg text-body-lg font-bold text-primary'>Weekly Summaries</p>
            <p className='font-body-sm text-body-sm text-on-surface-variant'>
              A comprehensive report of your weekly spending.
            </p>
          </div>
          <div className='relative inline-flex items-center cursor-pointer'>
            <input className='sr-only peer' type='checkbox' defaultChecked />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
          </div>
        </div>
        <div className='py-4 flex justify-between items-center'>
          <div>
            <p className='font-body-lg text-body-lg font-bold text-primary'>
              Marketing Communications
            </p>
            <p className='font-body-sm text-body-sm text-on-surface-variant'>
              Stay updated on new features and investment tips.
            </p>
          </div>
          <div className='relative inline-flex items-center cursor-pointer'>
            <input className='sr-only peer' type='checkbox' />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
