'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MemoryEntry {
  topic: string
  runCount: number
  lastRunAt: string
  seenUrls: string[]
  keyFacts: string[]
  reportSummary: string
  _key: string
}

function memorySlug(key: string) {
  return key.split(':').pop() ?? key
}

export default function MemoryBank() {
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load() {
    try {
      const res = await fetch('/api/memory')
      if (res.ok) setMemories(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = memories.filter((m) =>
    !search || m.topic.toLowerCase().includes(search.toLowerCase())
  )

  const totalUrls = memories.reduce((sum, mem) => sum + mem.seenUrls.length, 0)
  const totalFacts = memories.reduce((sum, mem) => sum + mem.keyFacts.length, 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#e5e2e3] mb-1">Memory Bank</h2>
          <p className="text-[13px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Persistent research memory indexed by topic. Open a topic to inspect facts, run history, and source ledgers.
          </p>
        </div>
        <button
          onClick={load}
          className="btn-ghost-cyan rounded-lg py-2 px-4 text-[11px] font-bold tracking-widest uppercase min-h-[44px]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">refresh</span>
          Refresh
        </button>
      </div>

      {memories.length > 0 && (
        <div className="relative mb-6">
          <span className="material-symbols-outlined text-[16px] text-[#849495] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="w-full bg-black/40 text-[#e5e2e3] text-[12px] pl-9 pr-3 py-2.5 border border-white/10 outline-none placeholder:text-[#3b494b] focus:border-cyan-400/40 transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#849495] hover:text-[#e5e2e3] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {[
          { icon: 'database', color: 'text-[#65f2b5]', label: 'Topics Indexed', value: loading ? '—' : String(memories.length) },
          { icon: 'link', color: 'text-cyan-400', label: 'URLs Seen', value: loading ? '—' : totalUrls >= 1000 ? `${(totalUrls / 1000).toFixed(1)}k` : String(totalUrls) },
          { icon: 'psychology', color: 'text-[#ddb7ff]', label: 'Key Facts Stored', value: loading ? '—' : String(totalFacts) },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className={`material-symbols-outlined text-[56px] ${s.color}`}>{s.icon}</span>
            </div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-[#849495] mb-3 flex items-center gap-2"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.color.replace('text-', 'bg-')}`} />
              {s.label}
            </div>
            <div className="text-4xl font-bold text-[#e5e2e3]">{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="glass-card rounded-xl p-12 text-center text-[#849495] text-sm">
          Loading memory bank...
        </div>
      ) : memories.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-slate-700 mb-3 block">memory</span>
          <p className="text-[#849495] text-sm mb-2">No memory entries yet.</p>
          <p className="text-[#3b494b] text-xs mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Run a research brief to start building persistent memory.
          </p>
          <Link href="/briefs/new" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
            Deploy your first agent →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-[#849495] text-sm"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          No topics match &ldquo;{search}&rdquo;
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((mem) => {
            const slug = memorySlug(mem._key)
            return (
              <Link
                key={mem._key}
                href={`/memory/${slug}`}
                className="glass-card rounded-xl p-5 block border border-white/10 hover:border-cyan-400/25 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#65f2b5] text-[18px] shrink-0">memory</span>
                      <div className="text-[14px] font-semibold text-[#e5e2e3] truncate"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {mem.topic}
                      </div>
                    </div>
                    <div className="text-[10px] text-[#3b494b] font-mono truncate">{mem._key}</div>
                  </div>
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 shrink-0"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    View details
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Runs', value: `${mem.runCount}` },
                    { label: 'Last Run', value: new Date(mem.lastRunAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                    { label: 'Sources', value: `${mem.seenUrls.length}` },
                    { label: 'Facts', value: `${mem.keyFacts.length}` },
                  ].map((item) => (
                    <div key={item.label} className="border border-white/5 bg-black/25 px-3 py-2">
                      <div className="text-[9px] font-bold tracking-widest uppercase text-[#849495] mb-1"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {item.label}
                      </div>
                      <div className="text-[12px] text-[#e5e2e3]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {mem.reportSummary && (
                  <div className="border border-white/5 bg-black/25 px-3 py-3">
                    <div className="text-[9px] font-bold tracking-widest uppercase text-[#65f2b5] mb-1"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Latest Summary
                    </div>
                    <p className="text-[12px] text-[#b9cacb] leading-relaxed line-clamp-2"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {mem.reportSummary}
                    </p>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
