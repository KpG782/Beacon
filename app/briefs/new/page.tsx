'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SOURCES = [
  { value: 'dashboard', label: 'Web Dashboard' },
  { value: 'slack',     label: 'Slack' },
  { value: 'github',    label: 'GitHub' },
  { value: 'discord',   label: 'Discord' },
]

const DRAFT_KEY = 'beacon:brief:draft'

export default function NewBriefPage() {
  const router       = useRouter()
  const [topic, setTopic]       = useState('')
  const [source, setSource]     = useState('dashboard')
  const [recurring, setRecurring] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Pre-fill topic from URL ?topic= (used by Memory Bank "Re-run")
  useEffect(() => {
    const saved = window.localStorage.getItem(DRAFT_KEY)
    if (saved) {
      try {
        const draft = JSON.parse(saved) as { topic?: string; source?: string; recurring?: boolean }
        if (draft.topic) setTopic(draft.topic)
        if (draft.source) setSource(draft.source)
        if (typeof draft.recurring === 'boolean') setRecurring(draft.recurring)
      } catch {}
    }

    const t = new URLSearchParams(window.location.search).get('topic')
    if (t) setTopic(decodeURIComponent(t))
  }, [])

  useEffect(() => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ topic, source, recurring }))
  }, [topic, source, recurring])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) { setError('Topic is required.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), source, recurring }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { runId } = await res.json()
      window.localStorage.removeItem(DRAFT_KEY)
      router.push(`/briefs/${runId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start research.')
      setLoading(false)
    }
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[#849495] text-[12px] mb-8"
           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#e5e2e3]">New Research Brief</span>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#e5e2e3] mb-2">Deploy New Agent</h2>
        <p className="text-[13px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Beacon fans out SerpAPI queries, synthesizes a report, and compounds memory across runs
          so each future report only shows what actually changed.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 flex flex-col gap-6">

        {/* Topic */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="topic"
            className="text-[11px] font-bold tracking-widest uppercase text-[#849495]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Research Topic
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. AI agent frameworks Q2 2025"
            autoFocus
            aria-required="true"
            className="w-full bg-black/40 border border-white/10 text-[#e5e2e3] text-[13px] px-4 py-3 rounded-lg outline-none transition-all min-h-[44px] placeholder:text-slate-600 focus:border-cyan-400/50 focus:shadow-[0_0_0_1px_rgba(0,219,233,0.3)]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          />
          {error && (
            <p role="alert" className="text-[11px] text-[#ffb4ab]"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {error}
            </p>
          )}
        </div>

        {/* Source */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="source"
            className="text-[11px] font-bold tracking-widest uppercase text-[#849495]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Source Channel
          </label>
          <select
            id="source"
            value={source}
            onChange={e => setSource(e.target.value)}
            className="w-full bg-black/40 border border-white/10 text-[#e5e2e3] text-[13px] px-4 py-3 rounded-lg outline-none min-h-[44px] focus:border-cyan-400/50 focus:shadow-[0_0_0_1px_rgba(0,219,233,0.3)] transition-all appearance-none cursor-pointer"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {SOURCES.map(s => (
              <option key={s.value} value={s.value} className="bg-[#1c1b1c]">{s.label}</option>
            ))}
          </select>
        </div>

        {/* Recurring */}
        <div className="flex items-center justify-between py-3 border-t border-white/10">
          <div>
            <div
              className="text-[11px] font-bold tracking-widest uppercase text-[#e5e2e3] mb-1"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Recurring (every 7 days)
            </div>
            <div className="text-[11px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Agent reruns automatically — reports only what changed
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={recurring}
            onClick={() => setRecurring(r => !r)}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ml-6 ${recurring ? 'bg-cyan-400' : 'bg-slate-700'}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${recurring ? 'translate-x-6' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="w-full btn-ghost-cyan rounded-lg py-3 flex items-center justify-center gap-2 text-[13px] font-bold tracking-widest uppercase min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              Initializing Agent...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              Deploy Research Agent
            </>
          )}
        </button>

      </form>

      {/* Info box */}
      <div className="mt-4 glass-panel rounded-xl p-4 flex gap-3">
        <span className="material-symbols-outlined text-cyan-400 text-[20px] shrink-0 mt-0.5">info</span>
        <p className="text-[12px] text-[#849495] leading-relaxed" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          The workflow is durable — it survives server restarts and browser closes.
          Run #1 builds a full report. Run #2+ deliver delta reports showing only
          new developments since the last scan.
        </p>
      </div>
    </div>
  )
}
