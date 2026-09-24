import { TooltipProvider } from '@/components/ui/tooltip'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'HandledMoney',
    template: '%s · HandledMoney',
  },
  description: 'HandledMoney — track accounts, categories, transactions, and budgets in one place.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/*
          Dependency-free dark mode: mirrors the system preference into the
          .dark class before hydration so the token contract in globals.css
          is applied coherently on first paint.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster position='top-right' />
        <TooltipProvider>
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
