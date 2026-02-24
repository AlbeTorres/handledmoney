'use client'
export default function CategoryPage() {
  return (
    <div className='bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display'>
      <div className='flex h-screen overflow-hidden'>
        <main className='flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden'>
          <header className='h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0'>
            <h2 className='text-lg font-bold'>Category Management</h2>
            <div className='flex items-center gap-4'>
              <button className='p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full'>
                <span className='material-symbols-outlined'>notifications</span>
              </button>
              <div className='h-8 w-[1px] bg-slate-200 dark:border-slate-800'></div>
              <button className='flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm shadow-primary/20'>
                <span className='material-symbols-outlined text-sm'>add</span>
                New Category
              </button>
            </div>
          </header>

          <div className='flex-1 flex overflow-hidden'>
            <div className='w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'>
              <div className='p-6'>
                <h3 className='text-xl font-bold mb-1'>Expense Categories</h3>
                <p className='text-sm text-slate-500 mb-6'>
                  Manage and organize your spending categories.
                </p>
                <div className='relative'>
                  <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
                    search
                  </span>
                  <input
                    className='w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm'
                    placeholder='Search categories...'
                    type='text'
                  />
                </div>
              </div>
              <div className='flex-1 overflow-y-auto px-6 pb-6 space-y-3'>
                <div className='flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-primary/20 shadow-sm ring-1 ring-primary/5 cursor-pointer'>
                  <div className='size-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mr-4'>
                    <span className='material-symbols-outlined text-2xl'>restaurant</span>
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-bold text-sm'>Food &amp; Dining</h4>
                    <p className='text-xs text-slate-500'>12 transactions this month</p>
                  </div>
                  <span className='material-symbols-outlined text-slate-400'>chevron_right</span>
                </div>
                <div className='flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all cursor-pointer'>
                  <div className='size-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4'>
                    <span className='material-symbols-outlined text-2xl'>directions_car</span>
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-bold text-sm'>Transportation</h4>
                    <p className='text-xs text-slate-500'>8 transactions this month</p>
                  </div>
                  <span className='material-symbols-outlined text-slate-400'>chevron_right</span>
                </div>
                <div className='flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all cursor-pointer'>
                  <div className='size-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4'>
                    <span className='material-symbols-outlined text-2xl'>home</span>
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-bold text-sm'>Rent &amp; Utilities</h4>
                    <p className='text-xs text-slate-500'>4 transactions this month</p>
                  </div>
                  <span className='material-symbols-outlined text-slate-400'>chevron_right</span>
                </div>
                <div className='flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all cursor-pointer'>
                  <div className='size-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-4'>
                    <span className='material-symbols-outlined text-2xl'>shopping_bag</span>
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-bold text-sm'>Shopping</h4>
                    <p className='text-xs text-slate-500'>15 transactions this month</p>
                  </div>
                  <span className='material-symbols-outlined text-slate-400'>chevron_right</span>
                </div>
                <div className='flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all cursor-pointer'>
                  <div className='size-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mr-4'>
                    <span className='material-symbols-outlined text-2xl'>fitness_center</span>
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-bold text-sm'>Health &amp; Wellness</h4>
                    <p className='text-xs text-slate-500'>2 transactions this month</p>
                  </div>
                  <span className='material-symbols-outlined text-slate-400'>chevron_right</span>
                </div>
              </div>
            </div>

            <div className='w-1/2 bg-white dark:bg-slate-900 p-8 flex flex-col overflow-y-auto'>
              <div className='max-w-md mx-auto w-full'>
                <div className='flex justify-between items-center mb-8'>
                  <h3 className='text-xl font-bold'>Edit Category</h3>
                  <span className='px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded'>
                    Modified
                  </span>
                </div>
                <form className='space-y-6'>
                  <div>
                    <label className='block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2'>
                      Category Name
                    </label>
                    <input
                      className='w-full px-4 py-2.5 bg-background-light dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium'
                      type='text'
                      onChange={e => {
                        console.log(e.target.value)
                      }}
                      value='Food &amp; Dining'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2'>
                      Choose Icon
                    </label>
                    <div className='grid grid-cols-6 gap-3 p-4 bg-background-light dark:bg-slate-800 rounded-xl'>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm ring-2 ring-primary'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>restaurant</span>
                      </button>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>directions_car</span>
                      </button>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>home</span>
                      </button>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>shopping_bag</span>
                      </button>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>theater_comedy</span>
                      </button>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>flight</span>
                      </button>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>school</span>
                      </button>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>payments</span>
                      </button>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>local_hospital</span>
                      </button>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>pets</span>
                      </button>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>savings</span>
                      </button>
                      <button
                        className='aspect-square rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors'
                        type='button'
                      >
                        <span className='material-symbols-outlined'>more_horiz</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2'>
                      Theme Color
                    </label>
                    <div className='flex items-center gap-4 p-4 bg-background-light dark:bg-slate-800 rounded-xl'>
                      <div className='flex flex-wrap gap-3 flex-1'>
                        <button
                          className='size-6 rounded-full bg-orange-500 ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-800'
                          type='button'
                        ></button>
                        <button className='size-6 rounded-full bg-blue-500' type='button'></button>
                        <button
                          className='size-6 rounded-full bg-purple-500'
                          type='button'
                        ></button>
                        <button className='size-6 rounded-full bg-green-500' type='button'></button>
                        <button className='size-6 rounded-full bg-red-500' type='button'></button>
                        <button className='size-6 rounded-full bg-teal-500' type='button'></button>
                        <button className='size-6 rounded-full bg-pink-500' type='button'></button>
                        <button className='size-6 rounded-full bg-slate-500' type='button'></button>
                      </div>
                      <div className='w-[1px] h-6 bg-slate-300 dark:bg-slate-600'></div>
                      <div className='flex items-center gap-2'>
                        <div className='size-8 rounded border border-slate-300 dark:border-slate-600 bg-orange-500 overflow-hidden relative'>
                          <input
                            className='absolute inset-0 opacity-0 cursor-pointer'
                            type='color'
                            onChange={e => {
                              console.log(e.target.value)
                            }}
                            value='#f97316'
                          />
                        </div>
                        <span className='text-xs font-mono text-slate-500'>#F97316</span>
                      </div>
                    </div>
                  </div>

                  <div className='pt-4'>
                    <label className='block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2'>
                      Preview Card
                    </label>
                    <div className='flex items-center p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800/50'>
                      <div className='size-12 rounded-xl bg-orange-500 flex items-center justify-center text-white mr-4 shadow-lg shadow-orange-500/30'>
                        <span className='material-symbols-outlined text-2xl'>restaurant</span>
                      </div>
                      <div>
                        <h4 className='font-bold text-sm text-orange-950 dark:text-orange-200'>
                          Food &amp; Dining
                        </h4>
                        <p className='text-xs text-orange-700 dark:text-orange-400/80'>
                          Active Category
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 pt-6'>
                    <button
                      className='flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all'
                      type='button'
                    >
                      Save Changes
                    </button>
                    <button
                      className='size-12 flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl hover:bg-red-100 transition-all'
                      type='button'
                    >
                      <span className='material-symbols-outlined'>delete</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
