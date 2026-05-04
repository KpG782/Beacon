'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface StoredKeyState {
  configured: boolean
  groq?: { masked?: string; set: boolean }
  serp?: { masked?: string; set: boolean }
  updatedAt?: string
}

export default function SettingsPage() {
  const [groqKey, setGroqKey] = useState('')
  const [serpKey, setSerpKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configured, setConfigured] = useState<StoredKeyState | null>(null)
  const [testGroq, setTestGroq] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [testSerp, setTestSerp] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')

  useEffect(() => {
    let active = true

    async function loadConfiguredKeys() {
      try {
        const res = await fetch('/api/profile/keys', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load key state')
        const data = await res.json() as StoredKeyState
        if (active) setConfigured(data)
      } catch {
        if (active) setConfigured({ configured: false })
      } finally {
        if (active) setLoading(false)
      }
    }

    loadConfiguredKeys()
    return () => {
      active = false
    }
  }, [])

  async function save() {
    if (!groqKey && !serpKey) return
    setSaving(true)
    try {
      const res = await fetch('/api/profile/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groqApiKey: groqKey || undefined,
          serpApiKey: serpKey || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to save keys')

      const refresh = await fetch('/api/profile/keys', { cache: 'no-store' })
      const data = await refresh.json() as StoredKeyState
      setConfigured(data)
      setGroqKey('')
      setSerpKey('')
      setSaved(true)
      setCleared(false)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setSaved(false)
    } finally {
      setSaving(false)
    }
  }

  async function clear() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile/keys', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to clear keys')
      setConfigured({ configured: false })
      setGroqKey('')
      setSerpKey('')
      setCleared(true)
      setSaved(false)
      setTimeout(() => setCleared(false), 2500)
    } catch {
      setCleared(false)
    } finally {
      setSaving(false)
    }
  }

  async function testGroqKey() {
    if (!groqKey) return
    setTestGroq('testing')
    try {
      const res = await fetch('/api/test-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groqApiKey: groqKey }),
      })
      const data = await res.json()
      setTestGroq(data?.groq?.ok ? 'ok' : 'fail')
    } catch {
      setTestGroq('fail')
    }
    setTimeout(() => setTestGroq('idle'), 4000)
  }

  async function testSerpKey() {
    if (!serpKey) return
    setTestSerp('testing')
    try {
      const res = await fetch('/api/test-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serpApiKey: serpKey }),
      })
      const data = await res.json()
      setTestSerp(data?.serpapi?.ok ? 'ok' : 'fail')
    } catch {
      setTestSerp('fail')
    }
    setTimeout(() => setTestSerp('idle'), 4000)
  }

  const storedGroq = configured?.groq?.set
  const storedSerp = configured?.serp?.set
  const hasStoredKeys = Boolean(storedGroq || storedSerp)
  const hasDraftKeys = Boolean(groqKey || serpKey)

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-8 lg:px-8 max-w-2xl">
      <div
        className="mb-8 flex items-center gap-2 text-[12px] text-[#849495]"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        <Link href="/dashboard" className="transition-colors hover:text-cyan-400">Dashboard</Link>
        <span className="text-[#3b494b]">/</span>
        <span className="text-[#e5e2e3]">Settings</span>
      </div>

      <h2 className="mb-1 text-2xl font-semibold text-[#e5e2e3]">Settings</h2>
      <p
        className="mb-8 text-[13px] text-[#849495]"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        Configure your personal API keys and review the current storage model.
      </p>

      <div className="glass-card rounded-xl p-0 mb-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h3
              className="text-[13px] font-semibold text-[#e5e2e3]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Your API Keys
            </h3>
            <p
              className="mt-0.5 text-[11px] text-[#849495]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Bring Your Own Keys for Groq and SerpAPI
            </p>
          </div>
          {hasStoredKeys ? (
            <span
              className="rounded border border-[#65f2b5]/30 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#65f2b5]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Stored server-side
            </span>
          ) : (
            <span
              className="rounded border border-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#849495]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Using defaults
            </span>
          )}
        </div>

        <div className="flex flex-col gap-5 p-5">
          <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-4 py-3">
            <div className="flex gap-2.5">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-[16px] text-cyan-400">info</span>
              <div
                className="text-[11px] leading-relaxed text-[#849495]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Beacon now stores configured keys through your authenticated account using encrypted server-side storage.
                The UI never fetches the raw key back after save. Enter a new key to replace it, or clear the stored keys
                entirely.
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
            <div
              className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#849495]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Current key state
            </div>
            {loading ? (
              <div
                className="text-[11px] text-[#849495]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Loading stored key status...
              </div>
            ) : (
              <div className="flex flex-col gap-2 text-[12px]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#849495]">Groq</span>
                  <span className="font-mono text-[11px] text-[#e5e2e3]">
                    {storedGroq ? configured?.groq?.masked : 'not configured'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#849495]">SerpAPI</span>
                  <span className="font-mono text-[11px] text-[#e5e2e3]">
                    {storedSerp ? configured?.serp?.masked : 'not configured'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#849495]">Last updated</span>
                  <span className="font-mono text-[11px] text-[#e5e2e3]">
                    {configured?.updatedAt ? new Date(configured.updatedAt).toLocaleString() : 'never'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                className="text-[11px] font-bold uppercase tracking-widest text-[#849495]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Groq API Key
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-cyan-400 transition-colors hover:text-cyan-300"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Get key →
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder={storedGroq ? 'Enter a new key to replace the stored key' : 'gsk_...'}
                autoComplete="off"
                className="flex-1 border border-white/10 bg-black/40 px-3 py-2.5 text-[12px] text-[#e5e2e3] outline-none transition-colors placeholder:text-[#3b494b] focus:border-cyan-400/40"
                style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              />
              <button
                onClick={testGroqKey}
                disabled={!groqKey || testGroq === 'testing'}
                className="border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#849495] transition-colors hover:border-white/20 hover:text-[#e5e2e3] disabled:opacity-30"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {testGroq === 'testing' ? '...' : testGroq === 'ok' ? '✓ ok' : testGroq === 'fail' ? '✗ fail' : 'Test'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                className="text-[11px] font-bold uppercase tracking-widest text-[#849495]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                SerpAPI Key
              </label>
              <a
                href="https://serpapi.com/manage-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-cyan-400 transition-colors hover:text-cyan-300"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Get key →
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={serpKey}
                onChange={(e) => setSerpKey(e.target.value)}
                placeholder={storedSerp ? 'Enter a new key to replace the stored key' : 'sk-...'}
                autoComplete="off"
                className="flex-1 border border-white/10 bg-black/40 px-3 py-2.5 text-[12px] text-[#e5e2e3] outline-none transition-colors placeholder:text-[#3b494b] focus:border-cyan-400/40"
                style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              />
              <button
                onClick={testSerpKey}
                disabled={!serpKey || testSerp === 'testing'}
                className="border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#849495] transition-colors hover:border-white/20 hover:text-[#e5e2e3] disabled:opacity-30"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {testSerp === 'testing' ? '...' : testSerp === 'ok' ? '✓ ok' : testSerp === 'fail' ? '✗ fail' : 'Test'}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={save}
              disabled={!hasDraftKeys || saving}
              className="btn-ghost-cyan min-h-[44px] flex-1 rounded-lg py-3 text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-40"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Keys'}
            </button>
            {hasStoredKeys && (
              <button
                onClick={clear}
                disabled={saving}
                className="rounded-lg border border-white/10 px-5 text-[11px] font-bold uppercase tracking-widest text-[#849495] transition-colors hover:border-[#ffb4ab]/40 hover:text-[#ffb4ab] disabled:opacity-40"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {cleared ? 'Cleared' : 'Clear all'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5 mb-6">
        <div
          className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#849495]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Application Config
        </div>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Version', value: 'v1.0.0 — Hackathon Build' },
            { label: 'Framework', value: 'Next.js 16 · Vercel Workflow SDK' },
            { label: 'Scout model', value: 'meta-llama/llama-4-scout-17b-16e-instruct' },
            { label: 'Synth model', value: 'llama-3.3-70b-versatile' },
            { label: 'Memory TTL', value: '30 days (Upstash Redis)' },
            { label: 'Key storage TTL', value: '90 days (encrypted)' },
            { label: 'Rate limit', value: '5 research runs / hour / IP' },
            { label: 'Max sources', value: '500 URLs per topic (deduped)' },
            { label: 'Sleep interval', value: '7 days (configurable)' },
          ].map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-4 text-[12px]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="shrink-0 text-[#849495]">{r.label}</span>
              <span className="text-right font-mono text-[11px] text-[#e5e2e3]">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div
          className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#849495]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Using Your Keys vs. Developer Keys
        </div>
        <div className="grid grid-cols-2 gap-4 text-[12px]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <div className="flex flex-col gap-2">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#849495]">Developer Keys</div>
            {['Shared rate limit', 'Shared provider quota', 'May throttle under load', 'No setup needed'].map((t) => (
              <div key={t} className="flex items-start gap-2 text-[#849495]">
                <span className="mt-0.5 shrink-0 text-[#3b494b]">→</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#65f2b5]">Your Keys</div>
            {['Your own provider limits', 'Encrypted account-scoped storage', 'No cross-user quota coupling', 'Can be deleted on demand'].map((t) => (
              <div key={t} className="flex items-start gap-2 text-[#849495]">
                <span className="mt-0.5 shrink-0 text-[#65f2b5]">✓</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
