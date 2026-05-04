import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isValidMcpToken } from '@/lib/auth'

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/trial(.*)',
  '/docs(.*)',
  '/support(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/disclaimer(.*)',
  '/api/public-search(.*)',
  '/api/public-download(.*)',
  '/api/trial(.*)',
  '/api/auth/(.*)',
  '/api/webhooks/(.*)',
  '/.well-known/(.*)',
  '/opengraph(.*)',
  '/icon(.*)',
  '/robots.txt',
  '/sitemap.xml',
])

// Routes that authenticated users should never reach — redirect them to dashboard.
const isAuthRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/login(.*)',
  '/register(.*)',
])

const PUBLIC_BODY_LIMITS: Array<{ prefix: string; bytes: number }> = [
  { prefix: '/api/trial', bytes: 16 * 1024 },
  { prefix: '/api/webhooks/', bytes: 256 * 1024 },
]

function applySecurityHeaders(res: NextResponse) {
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https: wss: https://clerk.com https://*.clerk.accounts.dev; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  )
  return res
}

function publicBodyLimitFor(pathname: string): number | null {
  const match = PUBLIC_BODY_LIMITS.find((entry) => pathname.startsWith(entry.prefix))
  return match?.bytes ?? null
}

export const proxy = clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl

  if (request.method === 'POST') {
    const maxBytes = publicBodyLimitFor(pathname)
    if (maxBytes !== null) {
      const contentLength = Number(request.headers.get('content-length') ?? '0')
      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        return applySecurityHeaders(
          NextResponse.json(
            { error: `payload too large: max ${Math.floor(maxBytes / 1024)}kb` },
            { status: 413 }
          )
        )
      }
    }
  }

  // MCP routes: accept Bearer token so external agents (Claude Desktop, Cursor)
  // can connect without a browser session.
  if (pathname.startsWith('/api/mcp/')) {
    const bearer = request.headers.get('Authorization')?.replace(/^Bearer /, '')
    if (isValidMcpToken(bearer)) return applySecurityHeaders(NextResponse.next())
  }

  // Session containment: signed-in users are locked inside the app.
  // The only exit is explicit sign-out — navigating to landing/auth pages
  // via the URL bar bounces them back to the dashboard.
  if (isAuthRoute(request)) {
    const { userId } = await auth()
    if (userId) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
    }
  }

  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  return applySecurityHeaders(NextResponse.next())
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
