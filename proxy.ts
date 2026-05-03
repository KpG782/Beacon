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
  '/api/trial(.*)',
  '/api/auth/(.*)',
  '/.well-known/(.*)',
  '/opengraph(.*)',
  '/icon(.*)',
  '/robots.txt',
  '/sitemap.xml',
])

export const proxy = clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl

  // MCP routes: accept Bearer token so external agents (Claude Desktop, Cursor)
  // can connect without a browser session.
  if (pathname.startsWith('/api/mcp/')) {
    const bearer = request.headers.get('Authorization')?.replace(/^Bearer /, '')
    if (isValidMcpToken(bearer)) return NextResponse.next()
  }

  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
