'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [dots, setDots]         = useState('')

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(id)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        const from = searchParams.get('from') || '/dashboard'
        router.replace(from)
      } else if (res.status === 429) {
        setError('Too many attempts. Try again later.')
      } else {
        setError('Invalid password.')
      }
    } catch {
      setError('Network error — check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-6">

      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-cyan-400/20 flex items-center justify-center border border-cyan-400/30">
          <span className="material-symbols-outlined text-cyan-400 text-[28px]">adjust</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tighter text-cyan-400"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            BEACON
          </h1>
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#849495] mt-0.5"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            AUTONOMOUS RESEARCH AGENT
          </p>
        </div>
      </div>

      {/* Terminal boot line */}
      <div className="glass-panel rounded-xl px-4 py-3">
        <p className="text-[11px] font-mono text-[#3b494b]">
          <span className="text-[#849495]">beacon@v1.0</span>
          {' › '}
          <span className="text-cyan-400">auth</span>
          {' › '}
          <span className="text-[#849495]">awaiting credentials{dots}</span>
        </p>
      </div>

      {/* Login form */}
      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-xl p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-[10px] font-bold tracking-widest uppercase text-[#849495]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Operator Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            autoComplete="current-password"
            className="w-full bg-black/40 border border-white/10 text-[#e5e2e3] text-[13px] px-4 py-3 rounded-lg outline-none transition-all placeholder:text-[#3b494b] focus:border-cyan-400/50 focus:shadow-[0_0_0_1px_rgba(0,219,233,0.2)]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          />
          {error && (
            <p role="alert" className="text-[11px] text-[#ffb4ab]"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full btn-ghost-cyan rounded-lg py-3 flex items-center justify-center gap-2 text-[12px] font-bold tracking-widest uppercase min-h-[44px] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="10"/>
              </svg>
              Authenticating...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">lock_open</span>
              Access Beacon
            </>
          )}
        </button>
      </form>

      {/* Setup hint */}
      <p className="text-center text-[10px] text-[#3b494b] leading-relaxed"
         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        Set <code className="text-[#849495]">BEACON_PASSWORD</code> and{' '}
        <code className="text-[#849495]">BEACON_SESSION_TOKEN</code> in{' '}
        <code className="text-[#849495]">.env.local</code> to enable auth.
        <br />
        If unset, any password grants access.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0a0a0a' }}
    >
      <Suspense fallback={
        <div className="text-[#849495] text-sm font-mono">Loading...</div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
