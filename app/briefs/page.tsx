'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BriefRecord {
  runId: string
  topic: string
  status: 'running' | 'sleeping' | 'complete' | 'failed'
  source: string
  recurring: boolean
  runCount: number
  hasMemory: boolean
  memoryFacts: number
  createdAt: string
  updatedAt?: string
  currentStep?: string
  frameworkId?: string
  deltaUrls?: string[]
}

const STATUS_BADGE: Record<string, string> = {
  running:  'badge-active',
  sleeping: 'badge-sleeping',
  complete: 'badge-complete',
  failed:   'badge-failed',
}

const SOURCE_ICON: Record<string, string> = {
  dashboard: 'dashboard',
  slack:     'chat_bubble',
  github:    'code',
  discord:   'forum',
  mcp:       'hub',
}

export default function AllBriefsPage() {
  const [briefs, setBriefs]       = useState<BriefRecord[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState<string>('all')

  useEffect(() => {
    fetch('/api/briefs')
      .then(r => r.ok ? r.json() : [])
      .then(setBriefs)
      .finally(() => setLoading(false))
  }, [])

  const filtered = briefs.filter(b => {
    const matchSearch = !search || b.topic.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = briefs.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-[#849495] mb-3"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
            <span className="text-[#3b494b]">/</span>
            <span className="text-[#e5e2e3]">All Briefs</span>
          </div>
          <h2 className="text-2xl font-semibold text-[#e5e2e3] mb-1">All Briefs</h2>
          <p className="text-[13px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Every research run — searchable, filterable.
          </p>
        </div>
        <Link
          href="/briefs/new"
          className="btn-ghost-cyan rounded-lg py-2.5 px-5 text-[11px] font-bold tracking-widest uppercase min-h-[44px] flex items-center gap-2 shrink-0"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Brief
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined text-[16px] text-[#849495] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by topic..."
            className="w-full bg-black/40 text-[#e5e2e3] text-[12px] pl-9 pr-3 py-2.5 border border-white/10 outline-none placeholder:text-[#3b494b] focus:border-cyan-400/40 transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'running', 'complete', 'sleeping', 'failed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-2 text-[10px] font-bold tracking-widest uppercase border transition-colors ${
                statusFilter === s
                  ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-400'
                  : 'border-white/10 text-[#849495] hover:border-white/20'
              }`}
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {s}{s !== 'all' && counts[s] ? ` (${counts[s]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Runs',    value: briefs.length,                       color: 'text-[#e5e2e3]' },
          { label: 'With Memory',   value: briefs.filter(b => b.hasMemory).length, color: 'text-[#65f2b5]' },
          { label: 'Active',        value: counts['running'] ?? 0,              color: 'text-cyan-400' },
          { label: 'Completed',     value: counts['complete'] ?? 0,             color: 'text-[#65f2b5]' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <div className="text-[10px] font-bold tracking-widest uppercase text-[#849495] mb-2"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="glass-card p-12 text-center text-[#849495] text-sm">Loading briefs...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-slate-700 mb-3 block">inbox</span>
          <p className="text-[#849495] text-sm mb-4">
            {search || statusFilter !== 'all' ? 'No briefs match your filters.' : 'No briefs yet.'}
          </p>
          {!search && statusFilter === 'all' && (
            <Link href="/briefs/new" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
              Deploy your first research agent →
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(b => (
            <Link
              key={b.runId}
              href={`/briefs/${b.runId}`}
              className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-cyan-400/20 transition-all group"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Status + source */}
              <div className="flex items-center gap-3 sm:w-40 shrink-0">
                <span className={`${STATUS_BADGE[b.status] ?? 'badge-sleeping'} text-[9px] px-2 py-0.5 font-bold tracking-wider uppercase`}
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {b.status}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#849495]"
                      title={b.source}>
                  {SOURCE_ICON[b.source] ?? 'link'}
                </span>
              </div>

              {/* Topic */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#e5e2e3] group-hover:text-cyan-400 transition-colors truncate"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {b.topic}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-[10px] text-[#3b494b] font-mono">{b.runId.slice(0, 12)}…</span>
                  {b.hasMemory && (
                    <span className="badge-delta text-[9px] px-1.5 py-0.5 font-bold tracking-wider uppercase"
                          style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      memory
                    </span>
                  )}
                  {b.recurring && (
                    <span className="text-[9px] text-[#ffb84e] font-bold tracking-wider uppercase"
                          style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      recurring
                    </span>
                  )}
                  {(b.deltaUrls?.length ?? 0) > 0 && (
                    <span className="text-[9px] text-cyan-400"
                          style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      +{b.deltaUrls!.length} new sources
                    </span>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-5 text-[11px] text-[#849495] shrink-0"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                <span>Run #{b.runCount}</span>
                <span>{new Date(b.updatedAt ?? b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="material-symbols-outlined text-[16px] text-[#3b494b] group-hover:text-cyan-400 transition-colors">
                  chevron_right
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
