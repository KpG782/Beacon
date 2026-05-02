import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, COOKIE_MAX_AGE, isAuthEnabled } from '@/lib/auth'
import { rateLimit, LIMITS } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  // Rate-limit login attempts to prevent brute-force
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl  = await rateLimit(ip, 'login', LIMITS.login.limit, LIMITS.login.windowSecs)

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  // If auth is disabled, any request succeeds
  if (!isAuthEnabled()) {
    const res = NextResponse.json({ ok: true, authDisabled: true })
    res.cookies.set(COOKIE_NAME, 'open', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    })
    return res
  }

  let password: string
  try {
    const body = await req.json()
    password = typeof body.password === 'string' ? body.password : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  const expected = process.env.BEACON_PASSWORD ?? ''
  // Constant-time comparison
  const matches = password.length === expected.length &&
    password.split('').every((c, i) => c === expected[i])

  if (!matches) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = process.env.BEACON_SESSION_TOKEN ?? 'beacon-dev-open'
  const res   = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
  return res
}
