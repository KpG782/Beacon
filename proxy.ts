import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// [Harness] Next.js 16 renamed middleware.ts to proxy.ts; export must be named 'proxy'
export function proxy(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
