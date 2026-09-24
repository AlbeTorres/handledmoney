import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Route prefixes that require an authenticated session. Every nested route
 * under these prefixes (create, detail, edit, import) is protected too.
 */
const PROTECTED_PREFIXES = [
  '/account',
  '/budget',
  '/category',
  '/dashboard',
  '/settings',
  '/transaction',
] as const

/**
 * Pure matcher deciding whether a pathname belongs to an authenticated
 * finance route. Segment-aware: allows the exact prefix or any nested path
 * under it, while never matching similar-but-different prefixes.
 */
export function isProtectedPath(pathname: string): boolean {
  if (!pathname.startsWith('/')) return false
  return PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public pages (/auth/*, landing, /privacy, /terms) and API routes run
  // without the session gate. Only protected finance routes pay the session
  // lookup cost.
  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Run on page routes only, skipping framework internals, API routes and
     * static assets. Protected vs public decisions happen in
     * `isProtectedPath`.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
