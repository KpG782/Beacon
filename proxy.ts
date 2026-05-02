import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME, isValidSession } from '@/lib/auth'

// Paths that are always public — no auth required
function isPublicPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '/login') return true
  if (pathname.startsWith('/api/auth/'))  return true   // login / logout routes
  if (pathname.startsWith('/.well-known/')) return true  // Workflow SDK manifests
  if (pathname.startsWith('/opengraph'))   return true
  if (pathname.startsWith('/icon'))        return true
  return false
}

// [Harness] Auth gate — runs on every request in Edge Runtime
// [Harness] Next.js 16 renamed middleware.ts to proxy.ts; export must be named 'proxy'
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) return NextResponse.next()

  const session = request.cookies.get(COOKIE_NAME)?.value
  if (isValidSession(session)) return NextResponse.next()

  // API routes → 401 JSON so fetch callers get a clean error
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Dashboard pages → redirect to /login with return-to param
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
