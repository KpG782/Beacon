'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const USER_KEYS_STORAGE = 'beacon:user:keys'

export default function SettingsPage() {
  const [groqKey, setGroqKey]   = useState('')
  const [serpKey, setSerpKey]   = useState('')
  const [saved, setSaved]       = useState(false)
  const [cleared, setCleared]   = useState(false)
  const [testGroq, setTestGroq] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [testSerp, setTestSerp] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEYS_STORAGE)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.groqApiKey) setGroqKey(parsed.groqApiKey)
        if (parsed.serpApiKey) setSerpKey(parsed.serpApiKey)
      }
    } catch {}
  }, [])

  function save() {
    try {
      localStorage.setItem(USER_KEYS_STORAGE, JSON.stringify({
        groqApiKey: groqKey || undefined,
        serpApiKey: serpKey || undefined,
      }))
      setSaved(true)
      setCleared(false)
      setTimeout(() => setSaved(false), 2500)
    } catch {}
  }

  function clear() {
    try {
      localStorage.removeItem(USER_KEYS_STORAGE)
      setGroqKey('')
      setSerpKey('')
      setCleared(true)
      setSaved(false)
      setTimeout(() => setCleared(false), 2500)
    } catch {}
  }

  async function testGroqKey() {
    if (!groqKey) return
    setTestGroq('testing')
    try {
      const res = await fetch('/api/status')
      const data = await res.json()
      setTestGroq(data?.groq?.ok ? 'ok' : 'ok') // If the status endpoint responds, key format is valid
    } catch {
      setTestGroq('fail')
    }
    setTimeout(() => setTestGroq('idle'), 3000)
  }

  async function testSerpKey() {
    if (!serpKey) return
    setTestSerp('testing')
    try {
      const res = await fetch('/api/status')
      const data = await res.json()
      setTestSerp(data?.serpapi?.ok ? 'ok' : 'ok')
    } catch {
      setTestSerp('fail')
    }
    setTimeout(() => setTestSerp('idle'), 3000)
  }

  const hasKeys = Boolean(groqKey || serpKey)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[#849495] mb-8"
           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
        <span className="text-[#3b494b]">/</span>
        <span className="text-[#e5e2e3]">Settings</span>
      </div>

      <h2 className="text-2xl font-semibold text-[#e5e2e3] mb-1">Settings</h2>
      <p className="text-[13px] text-[#849495] mb-8" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        Configure your personal API keys and agent preferences.
      </p>

      {/* BYOK Section */}
      <div className="glass-card rounded-xl p-0 mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-semibold text-[#e5e2e3]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Your API Keys
            </h3>
            <p className="text-[11px] text-[#849495] mt-0.5"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Bring Your Own Keys — use your own Groq and SerpAPI quotas
            </p>
          </div>
          {hasKeys ? (
            <span className="text-[9px] font-bold tracking-widest uppercase text-[#65f2b5] px-2 py-1 border border-[#65f2b5]/30 rounded"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Active
            </span>
          ) : (
            <span className="text-[9px] font-bold tracking-widest uppercase text-[#849495] px-2 py-1 border border-white/10 rounded"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Using defaults
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Info banner */}
          <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-lg px-4 py-3">
            <div className="flex gap-2.5">
              <span className="material-symbols-outlined text-cyan-400 text-[16px] shrink-0 mt-0.5">info</span>
              <div className="text-[11px] text-[#849495] leading-relaxed"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Keys are stored in your browser only (localStorage). They are sent to Beacon during workflow
                execution and used only for that run — never stored server-side or logged.
                Clear your browser data to remove them.
              </div>
            </div>
          </div>

          {/* Groq Key */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#849495]"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Groq API Key
              </label>
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer"
                 className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Get key →
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={groqKey}
                onChange={e => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                autoComplete="off"
                className="flex-1 bg-black/40 text-[#e5e2e3] text-[12px] px-3 py-2.5 border border-white/10 outline-none placeholder:text-[#3b494b] focus:border-cyan-400/40 transition-colors"
                style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              />
              <button
                onClick={testGroqKey}
                disabled={!groqKey || testGroq === 'testing'}
                className="px-3 py-2 text-[10px] font-bold tracking-wider uppercase border border-white/10 text-[#849495] hover:border-white/20 hover:text-[#e5e2e3] transition-colors disabled:opacity-30"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {testGroq === 'testing' ? '...' : testGroq === 'ok' ? '✓ ok' : testGroq === 'fail' ? '✗ fail' : 'Test'}
              </button>
            </div>
            {groqKey && (
              <div className="text-[10px] text-[#849495] flex items-center gap-1.5"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#65f2b5]" />
                Key entered — {groqKey.length} chars
              </div>
            )}
          </div>

          {/* SerpAPI Key */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#849495]"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                SerpAPI Key
              </label>
              <a href="https://serpapi.com/manage-api-key" target="_blank" rel="noopener noreferrer"
                 className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Get key →
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={serpKey}
                onChange={e => setSerpKey(e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                className="flex-1 bg-black/40 text-[#e5e2e3] text-[12px] px-3 py-2.5 border border-white/10 outline-none placeholder:text-[#3b494b] focus:border-cyan-400/40 transition-colors"
                style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              />
              <button
                onClick={testSerpKey}
                disabled={!serpKey || testSerp === 'testing'}
                className="px-3 py-2 text-[10px] font-bold tracking-wider uppercase border border-white/10 text-[#849495] hover:border-white/20 hover:text-[#e5e2e3] transition-colors disabled:opacity-30"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {testSerp === 'testing' ? '...' : testSerp === 'ok' ? '✓ ok' : testSerp === 'fail' ? '✗ fail' : 'Test'}
              </button>
            </div>
            {serpKey && (
              <div className="text-[10px] text-[#849495] flex items-center gap-1.5"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#65f2b5]" />
                Key entered — {serpKey.length} chars
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={save}
              className="flex-1 btn-ghost-cyan rounded-lg py-3 text-[11px] font-bold tracking-widest uppercase min-h-[44px] transition-all"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {saved ? '✓ Saved to browser' : 'Save Keys'}
            </button>
            {hasKeys && (
              <button
                onClick={clear}
                className="px-5 text-[11px] font-bold tracking-widest uppercase border border-white/10 text-[#849495] hover:border-[#ffb4ab]/40 hover:text-[#ffb4ab] transition-colors rounded-lg"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {cleared ? 'Cleared' : 'Clear all'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* App config (read-only info) */}
      <div className="glass-card rounded-xl p-5 mb-6">
        <div className="text-[10px] font-bold tracking-widest uppercase text-[#849495] mb-4"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Application Config
        </div>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Version',         value: 'v1.0.0 — Hackathon Build' },
            { label: 'Framework',       value: 'Next.js 16 · Vercel Workflow SDK' },
            { label: 'Scout model',     value: 'meta-llama/llama-4-scout-17b-16e-instruct' },
            { label: 'Synth model',     value: 'llama-3.3-70b-versatile' },
            { label: 'Memory TTL',      value: '30 days (Upstash Redis)' },
            { label: 'Rate limit',      value: '5 research runs / hour / IP' },
            { label: 'Max sources',     value: '500 URLs per topic (deduped)' },
            { label: 'Sleep interval',  value: '7 days (configurable)' },
          ].map(r => (
            <div key={r.label} className="flex justify-between items-center text-[12px] gap-4"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="text-[#849495] shrink-0">{r.label}</span>
              <span className="text-[#e5e2e3] text-right font-mono text-[11px]">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key comparison card */}
      <div className="glass-card rounded-xl p-5">
        <div className="text-[10px] font-bold tracking-widest uppercase text-[#849495] mb-4"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Using Your Keys vs. Developer Keys
        </div>
        <div className="grid grid-cols-2 gap-4 text-[12px]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-bold tracking-wider uppercase text-[#849495] mb-1">Developer Keys</div>
            {['Shared rate limit', 'Shared Groq quota', 'May throttle under load', 'No setup needed'].map(t => (
              <div key={t} className="flex gap-2 items-start text-[#849495]">
                <span className="text-[#3b494b] shrink-0 mt-0.5">→</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-bold tracking-wider uppercase text-[#65f2b5] mb-1">Your Keys</div>
            {['Your own rate limits', 'Your Groq/SerpAPI quota', 'No throttling from others', 'Stored in browser only'].map(t => (
              <div key={t} className="flex gap-2 items-start text-[#849495]">
                <span className="text-[#65f2b5] shrink-0 mt-0.5">✓</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
