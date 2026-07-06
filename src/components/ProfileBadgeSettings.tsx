import { LucideEdit2 } from 'lucide-react'

export default function ProfileBadgeSettings() {
  return (
    <section className='mb-8 relative overflow-hidden rounded-xl bg-foreground p-6 flex flex-col md:flex-row items-center gap-6'>
      <div className='relative z-10'>
        <div className='w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden shadow-xl'>
          <img
            className='w-full h-full object-cover'
            data-alt='A detailed close-up portrait of a successful financial advisor. The setting is a bright, modern office with floor-to-ceiling windows showing a blurred cityscape. The image is captured in high resolution with natural daylight creating a soft, professional glow. The overall mood is one of trust, clarity, and precision, aligning with the ZenMoney brand identity.'
            src='https://lh3.googleusercontent.com/aida-public/AB6AXuCBs7VWo1CopJCn4DZQECuJ11XjSJO0fOboVfhVjgkJ6kfYp14qOYoC2ELcdryRk-0B8xjGXXHe34NhLBe0_kaflFoxwXLV5UbuTxxhr1nNnvgh8ulz7_ZWQogUde86_PgD-0moDi2DllJPvolwxx3ZtKGMtATwbhYzxew4lBOxx7cz1OSttBGK2fGrPUcP-yWb5ug4hy82_gEcw-f3u4ezfBf2dX7iEHzxEM9pCpEj7ruTuaIJJrrw'
          />
        </div>
        <button className='absolute bottom-0 right-0 w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center border-4 border-primary-container hover:scale-105 transition-transform'>
          <LucideEdit2 size={20} />
        </button>
      </div>
      <div className='relative z-10 text-center space-y-1 md:text-left'>
        <h1 className='text-3xl text-white'>Alex Sterling</h1>
        <p className='text-white'>Chief Financial Officer • Joined Jan 2022</p>
        <div className='mt-4 flex gap-2 justify-center md:justify-start'>
          <span className='px-3 py-1 bg-primary text-sm text-primary-foreground rounded-full border border-primary/30'>
            2FA Enabled
          </span>
        </div>
      </div>
    </section>
  )
}
