import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.

  let language = 'en'

  const locale = language

  return {
    locale,
    messages: (await import(`@/../messages/${locale}.json`)).default,
  }
})
