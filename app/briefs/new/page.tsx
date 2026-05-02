'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FRAMEWORKS, FRAMEWORK_CATEGORIES, type FrameworkOption } from '@/lib/frameworks'

const SOURCES = [
  { value: 'dashboard', label: 'Dashboard', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
  { value: 'slack', label: 'Slack', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>
  )},
  { value: 'github', label: 'GitHub', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
  )},
  { value: 'discord', label: 'Discord', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.081.114 18.104.132 18.116a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
  )},
]

const DEPTH_OPTIONS = [
  { value: 'quick', label: 'Quick Scan', meta: '5–7 queries · ~45s' },
  { value: 'deep',  label: 'Deep Dive',  meta: '8–10 queries · ~90s' },
]

const DRAFT_KEY = 'beacon:brief:draft'

interface MemoryPreview {
  topic: string
  runCount: number
  urlsIndexed: number
  factsStored: number
  lastRunAt: string
  reportSummary: string
}

function FrameworkRow({
  fw,
  selected,
  onSelect,
}: {
  fw: FrameworkOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-start gap-2.5 px-5 py-2.5 text-left transition-colors duration-100 cursor-pointer hover:bg-white/5 ${
        selected ? 'bg-cyan-400/5 border-l-2 border-cyan-400' : 'border-l-2 border-transparent'
      }`}
    >
      <span className={`w-2 h-2 rounded-full border shrink-0 mt-1 flex items-center justify-center ${
        selected ? 'border-cyan-400 bg-cyan-400' : 'border-white/20 bg-transparent'
      }`}>
        {selected && <span className="w-1 h-1 rounded-full bg-black block" />}
      </span>
      <div className="min-w-0">
        <p className={`text-[12px] font-semibold transition-colors ${selected ? 'text-cyan-400' : 'text-[#e5e2e3]'}`}
           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          {fw.name}
        </p>
        <p className="text-[10px] text-[#849495] line-clamp-1"
           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          {fw.description}
        </p>
      </div>
    </button>
  )
}

export default function NewBriefPage() {
  const router = useRouter()
  const [topic, setTopic]               = useState('')
  const [source, setSource]             = useState('dashboard')
  const [depth, setDepth]               = useState<'quick' | 'deep'>('deep')
  const [recurring, setRecurring]       = useState(false)
  const [frameworkId, setFrameworkId]   = useState<string | null>(null)
  const [fwOpen, setFwOpen]             = useState(false)
  const [fwSearch, setFwSearch]         = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [memory, setMemory]             = useState<MemoryPreview | null | 'checking'>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedFramework: FrameworkOption | null = frameworkId
    ? (FRAMEWORKS.find((f) => f.id === frameworkId) ?? null)
    : null

  const filteredFrameworks = fwSearch.trim()
    ? FRAMEWORKS.filter((f) =>
        f.name.toLowerCase().includes(fwSearch.toLowerCase()) ||
        f.description.toLowerCase().includes(fwSearch.toLowerCase())
      )
    : null

  useEffect(() => {
    const saved = window.localStorage.getItem(DRAFT_KEY)
    if (saved) {
      try {
        const d = JSON.parse(saved) as { topic?: string; source?: string; recurring?: boolean; depth?: 'quick' | 'deep'; frameworkId?: string }
        if (d.topic)   setTopic(d.topic)
        if (d.source)  setSource(d.source)
        if (typeof d.recurring === 'boolean') setRecurring(d.recurring)
        if (d.depth)   setDepth(d.depth)
        if (d.frameworkId) setFrameworkId(d.frameworkId)
      } catch {}
    }
    const t = new URLSearchParams(window.location.search).get('topic')
    if (t) setTopic(decodeURIComponent(t))
  }, [])

  useEffect(() => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ topic, source, recurring, depth, frameworkId }))
  }, [topic, source, recurring, depth, frameworkId])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!topic.trim() || topic.trim().length < 4) { setMemory(null); return }
    setMemory('checking')
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/memory/check?topic=${encodeURIComponent(topic.trim())}`)
        setMemory(await res.json())
      } catch { setMemory(null) }
    }, 600)
  }, [topic])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) { setError('Topic is required.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), source, recurring, depth, frameworkId: frameworkId ?? undefined }),
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

  const hasMemory  = memory !== null && memory !== 'checking' && typeof memory === 'object'
  const isFirstRun = memory === null && topic.trim().length >= 4
  const mem        = hasMemory ? (memory as MemoryPreview) : null

  return (
    <div className="px-6 py-6 flex flex-col gap-6 max-w-5xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[#849495]"
           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        <Link href="/dashboard" className="hover:text-cyan-400 transition-colors cursor-pointer">Dashboard</Link>
        <span className="text-[#3b494b]">/</span>
        <span className="text-[#e5e2e3]">New Research Brief</span>
      </div>

      {/* Page title row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#e5e2e3] mb-1">Deploy Research Agent</h2>
          <p className="text-[12px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Fans out parallel queries · synthesizes a delta report · compounds memory across runs
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#849495]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>mode</span>
          <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm ${
            hasMemory
              ? 'badge-delta'
              : 'bg-white/5 border border-white/10 text-[#849495]'
          }`}
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {hasMemory ? 'delta' : 'full'}
          </span>
        </div>
      </div>

      {/* ── Two-column grid ─────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Topic input */}
          <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
            <label htmlFor="topic"
                   className="text-[10px] font-bold tracking-widest uppercase text-[#849495]"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Research Topic
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent) } }}
              placeholder="e.g. AI agent frameworks Q2 2026"
              autoFocus
              rows={3}
              aria-required="true"
              className="w-full bg-transparent text-[#e5e2e3] text-[13px] resize-none outline-none placeholder:text-[#3b494b] transition-colors duration-150"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                borderBottom: '1px solid',
                borderColor: topic.trim() ? 'rgba(0,219,233,0.4)' : 'rgba(255,255,255,0.08)',
                paddingBottom: '8px',
                lineHeight: 1.6,
              }}
            />
            {error && (
              <p role="alert" className="text-[11px] text-[#ffb4ab]"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {error}
              </p>
            )}
          </div>

          {/* Memory status — fixed min-height prevents layout shift */}
          <div className="glass-card rounded-xl p-5 min-h-[108px] flex flex-col justify-center gap-3">
            {memory === 'checking' && (
              <div className="flex items-center gap-2 text-[11px] text-[#849495]"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                <svg className="w-3.5 h-3.5 animate-spin text-[#849495]" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="10"/>
                </svg>
                Checking memory bank...
              </div>
            )}

            {isFirstRun && (
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#849495] shrink-0 mt-1.5" />
                <div>
                  <p className="text-[12px] text-[#e5e2e3] mb-0.5"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    No prior memory
                  </p>
                  <p className="text-[11px] text-[#3b494b]"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Run #1 will build a full baseline report and index all sources into memory.
                  </p>
                </div>
              </div>
            )}

            {mem && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"
                        style={{ boxShadow: '0 0 6px rgba(0,219,233,0.7)' }} />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-400"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Memory found — Run #{mem.runCount + 1} will be delta
                  </span>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-0 border border-white/10 rounded overflow-hidden">
                  {[
                    { label: 'Prior Runs', val: mem.runCount },
                    { label: 'URLs',       val: mem.urlsIndexed },
                    { label: 'Facts',      val: mem.factsStored },
                  ].map((item, i) => (
                    <div key={i}
                         className={`px-3 py-2.5 flex flex-col gap-0.5 bg-white/5 ${i < 2 ? 'border-r border-white/10' : ''}`}>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-[#849495]"
                            style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {item.label}
                      </span>
                      <span className="text-[17px] text-[#e5e2e3] font-mono leading-none">
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
                {mem.reportSummary && (
                  <p className="text-[10px] text-[#849495] line-clamp-2"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Last: {new Date(mem.lastRunAt).toLocaleDateString()} — {mem.reportSummary.slice(0, 120)}
                  </p>
                )}
              </div>
            )}

            {!topic.trim() && memory === null && (
              <p className="text-[11px] text-[#3b494b]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Enter a topic to check prior memory state
              </p>
            )}
          </div>

          {/* Framework picker */}
          <div className="glass-card rounded-xl overflow-hidden">
            {/* Header — always visible */}
            <button
              type="button"
              onClick={() => setFwOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-white/5 transition-colors duration-150"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#849495]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Research Framework
                </span>
                {selectedFramework ? (
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm bg-cyan-400/10 border border-cyan-400/30 text-cyan-400"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {selectedFramework.name}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#3b494b]"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    optional
                  </span>
                )}
              </div>
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`w-3.5 h-3.5 text-[#849495] transition-transform duration-150 ${fwOpen ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded content */}
            {fwOpen && (
              <div className="border-t border-white/5">
                {/* Search input */}
                <div className="px-5 py-3 border-b border-white/5">
                  <input
                    type="text"
                    value={fwSearch}
                    onChange={e => setFwSearch(e.target.value)}
                    placeholder="Filter frameworks..."
                    className="w-full bg-black/40 text-[#e5e2e3] text-[12px] px-3 py-2 rounded-lg border border-white/10 outline-none placeholder:text-[#3b494b] focus:border-cyan-400/40 transition-colors"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  />
                </div>

                {/* Framework list */}
                <div className="overflow-y-auto max-h-[280px] py-1.5">
                  {/* No framework option */}
                  {!fwSearch.trim() && (
                    <button
                      type="button"
                      onClick={() => { setFrameworkId(null); setFwOpen(false) }}
                      className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-left transition-colors duration-100 cursor-pointer hover:bg-white/5 ${
                        frameworkId === null ? 'bg-white/5' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full border shrink-0 flex items-center justify-center ${
                        frameworkId === null
                          ? 'border-cyan-400 bg-cyan-400'
                          : 'border-white/20 bg-transparent'
                      }`}>
                        {frameworkId === null && (
                          <span className="w-1 h-1 rounded-full bg-black block" />
                        )}
                      </span>
                      <div>
                        <p className="text-[12px] text-[#e5e2e3]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          No framework
                        </p>
                        <p className="text-[10px] text-[#3b494b]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          General-purpose research report
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Filtered flat list during search */}
                  {filteredFrameworks && filteredFrameworks.length === 0 && (
                    <p className="px-5 py-4 text-[11px] text-[#3b494b]"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      No frameworks match "{fwSearch}"
                    </p>
                  )}
                  {filteredFrameworks && filteredFrameworks.map(fw => (
                    <FrameworkRow
                      key={fw.id}
                      fw={fw}
                      selected={frameworkId === fw.id}
                      onSelect={() => { setFrameworkId(fw.id); setFwSearch(''); setFwOpen(false) }}
                    />
                  ))}

                  {/* Categorized list when not searching */}
                  {!filteredFrameworks && FRAMEWORK_CATEGORIES.map(cat => (
                    <div key={cat}>
                      <p className="px-5 pt-3 pb-1 text-[9px] font-bold tracking-widest uppercase text-[#3b494b]"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {cat}
                      </p>
                      {FRAMEWORKS.filter(f => f.category === cat).map(fw => (
                        <FrameworkRow
                          key={fw.id}
                          fw={fw}
                          selected={frameworkId === fw.id}
                          onSelect={() => { setFrameworkId(fw.id); setFwOpen(false) }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Agent config preview */}
          <div className="glass-panel rounded-xl p-4 flex flex-col gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#f97316]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Agent Config
            </span>
            <pre className="text-[11px] text-[#849495] leading-relaxed"
                 style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{`topic     ${topic.trim() ? `"${topic.trim()}"` : '<pending>'}
depth     ${depth}  // ${depth === 'quick' ? '5–7 queries' : '8–10 queries'}
mode      ${hasMemory ? 'delta' : 'full'}  // ${hasMemory ? 'show only new findings' : 'build baseline'}
source    ${source}
recurring ${recurring}${recurring ? '  // sleep(7 days) between runs' : ''}${frameworkId ? `\nframework ${frameworkId}` : ''}
memory    ${mem ? `${mem.urlsIndexed} urls indexed` : 'null  // first run'}`}
            </pre>
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Search depth */}
          <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#849495]"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Search Depth
            </label>
            <div className="flex flex-col gap-2">
              {DEPTH_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDepth(opt.value as 'quick' | 'deep')}
                  aria-pressed={depth === opt.value}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                    depth === opt.value
                      ? 'border-cyan-400/50 bg-cyan-400/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      depth === opt.value ? 'bg-cyan-400' : 'bg-white/20'
                    }`} style={depth === opt.value ? { boxShadow: '0 0 5px rgba(0,219,233,0.6)' } : {}} />
                    <span className={`text-[12px] font-semibold transition-colors ${
                      depth === opt.value ? 'text-[#e5e2e3]' : 'text-[#849495]'
                    }`} style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {opt.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#3b494b]"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {opt.meta}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Source channel */}
          <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#849495]"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Source Channel
            </label>
            <div className="flex flex-col gap-1.5">
              {SOURCES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSource(s.value)}
                  aria-pressed={source === s.value}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                    source === s.value
                      ? 'border-cyan-400/50 bg-cyan-400/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <span className={`transition-colors ${source === s.value ? 'text-cyan-400' : 'text-[#849495]'}`}>
                    {s.icon}
                  </span>
                  <span className={`text-[12px] font-semibold transition-colors ${
                    source === s.value ? 'text-[#e5e2e3]' : 'text-[#849495]'
                  }`} style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recurring */}
          <div className="glass-card rounded-xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold text-[#e5e2e3] mb-0.5"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Recurring
              </p>
              <p className="text-[10px] text-[#3b494b]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                sleep(7 days) between runs
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={recurring}
              onClick={() => setRecurring(r => !r)}
              className="cursor-pointer shrink-0 relative w-11 h-6 rounded-full transition-colors duration-150"
              style={{ background: recurring ? 'rgba(0,219,233,0.25)' : 'rgba(255,255,255,0.08)',
                       border: `1px solid ${recurring ? 'rgba(0,219,233,0.6)' : 'rgba(255,255,255,0.1)'}` }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-150"
                style={{ transform: recurring ? 'translateX(20px)' : 'translateX(1px)' }}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full btn-ghost-cyan rounded-xl py-3.5 flex items-center justify-center gap-2 text-[12px] font-bold tracking-widest uppercase min-h-[48px] transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {loading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="10"/>
                </svg>
                Initializing...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.198-8.32 15.093 15.093 0 0 1 6.76-4.39"/>
                </svg>
                {hasMemory ? 'Deploy Delta Agent' : 'Deploy Research Agent'}
              </>
            )}
          </button>

          {/* Footer note */}
          <p className="text-[10px] text-[#3b494b] text-center leading-relaxed"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Durable workflow · survives restarts · other agents can call{' '}
            <code className="text-[#849495] font-mono">get_topic_delta</code> via MCP
          </p>
        </div>

      </form>
    </div>
  )
}
