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

function SourceLedger({ urls }: { urls: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const visible = expanded ? urls : urls.slice(0, 12)

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(urls.join('\n'))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[9px] font-bold tracking-widest uppercase text-[#3b494b]"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Source Ledger ({urls.length} total)
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={copyAll}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {copied ? 'Copied' : 'Copy all URLs'}
          </button>
          {urls.length > 12 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-[10px] text-[#849495] hover:text-[#e5e2e3] transition-colors"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {expanded ? 'Show less' : `Show all ${urls.length}`}
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        {visible.map((url, i) => {
          let host = url
          let path = ''
          try {
            const parsed = new URL(url)
            host = parsed.hostname.replace('www.', '')
            path = parsed.pathname === '/' ? '' : parsed.pathname
          } catch {}

          const safeHref = url.startsWith('http://') || url.startsWith('https://') ? url : '#'
          return (
            <a
              key={`${url}-${i}`}
              href={safeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 border border-white/5 bg-black/25 px-3 py-2 hover:border-cyan-400/25 hover:bg-black/35 transition-colors"
            >
              <div className="min-w-0">
                <div
                  className="text-[11px] text-cyan-400 truncate"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {host}
                </div>
                <div
                  className="text-[10px] text-[#849495] break-all"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {path || url}
                </div>
              </div>
              <span className="material-symbols-outlined text-[14px] text-slate-600 shrink-0 mt-0.5">
                open_in_new
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

function FactsList({ facts }: { facts: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? facts : facts.slice(0, 3)
  return (
    <div>
      <ol className="flex flex-col gap-1">
        {visible.map((f, i) => (
          <li key={i} className="flex gap-2 text-[12px] text-[#b9cacb]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            <span className="text-[#65f2b5] shrink-0">{i + 1}.</span>
            <span>{f}</span>
          </li>
        ))}
      </ol>
      {facts.length > 3 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 mt-2 transition-colors"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {expanded ? '↑ Show less' : `+ ${facts.length - 3} more facts`}
        </button>
      )}
    </div>
  )
}

export default function MemoryBank() {
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/memory')
      if (res.ok) setMemories(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(key: string) {
    if (!confirm('Delete this memory? The next research run for this topic will start from scratch.')) return
    setDeleting(key)
    await fetch('/api/memory', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) })
    setMemories(m => m.filter(e => e._key !== key))
    setDeleting(null)
  }

  const totalUrls  = memories.reduce((s, m) => s + m.seenUrls.length, 0)
  const totalFacts = memories.reduce((s, m) => s + m.keyFacts.length, 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-[#e5e2e3] mb-1">Memory Bank</h2>
          <p className="text-[13px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Persistent cross-session knowledge indexed by Beacon across all research runs.
          </p>
        </div>
        <button onClick={load} className="btn-ghost-cyan rounded-lg py-2 px-4 text-[11px] font-bold tracking-widest uppercase min-h-[44px]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">refresh</span>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {[
          { icon: 'database',  color: 'text-[#65f2b5]', label: 'Topics Indexed',  value: loading ? '—' : String(memories.length) },
          { icon: 'link',      color: 'text-cyan-400',  label: 'URLs Seen',       value: loading ? '—' : totalUrls >= 1000 ? (totalUrls/1000).toFixed(1)+'k' : String(totalUrls) },
          { icon: 'psychology',color: 'text-[#ddb7ff]', label: 'Key Facts Stored',value: loading ? '—' : String(totalFacts) },
        ].map(s => (
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

      {/* Memory cards */}
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
      ) : (
        <div className="flex flex-col gap-4">
          {memories.map(mem => (
            <div key={mem._key} className="glass-card rounded-xl p-0 flex flex-col">
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#65f2b5] text-[18px]">memory</span>
                  <div>
                    <div className="text-[13px] font-semibold text-[#e5e2e3]"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {mem.topic}
                    </div>
                    <div className="text-[10px] text-[#849495] font-mono">{mem._key}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/graph?topic=${encodeURIComponent(mem.topic)}`}
                    className="text-[11px] text-[#65f2b5] hover:text-[#8af7c6] transition-colors flex items-center gap-1"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    <span className="material-symbols-outlined text-[14px]">hub</span>
                    Graph
                  </Link>
                  <Link
                    href={`/briefs/new?topic=${encodeURIComponent(mem.topic)}`}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    <span className="material-symbols-outlined text-[14px]">replay</span>
                    Re-run
                  </Link>
                  <button
                    onClick={() => handleDelete(mem._key)}
                    disabled={deleting === mem._key}
                    className="text-[11px] text-slate-600 hover:text-[#ffb4ab] transition-colors flex items-center gap-1 min-w-[44px] min-h-[44px] justify-center"
                    aria-label="Delete memory"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {deleting === mem._key ? 'progress_activity' : 'delete'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div className="px-5 py-4 grid grid-cols-12 gap-5">
                {/* Left: meta */}
                <div className="col-span-12 md:col-span-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    {[
                      { icon: 'replay',        label: 'Run Count',    value: `${mem.runCount} run${mem.runCount !== 1 ? 's' : ''}` },
                      { icon: 'schedule',      label: 'Last Run',     value: new Date(mem.lastRunAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                      { icon: 'link',          label: 'URLs Indexed', value: `${mem.seenUrls.length} sources` },
                      { icon: 'psychology',    label: 'Facts',        value: `${mem.keyFacts.length} extracted` },
                    ].map(row => (
                      <div key={row.label} className="flex items-center gap-2 text-[12px]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        <span className="material-symbols-outlined text-[14px] text-[#849495]">{row.icon}</span>
                        <span className="text-[#849495]">{row.label}:</span>
                        <span className="text-[#e5e2e3]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: summary + facts */}
                <div className="col-span-12 md:col-span-8 flex flex-col gap-3">
                  {mem.reportSummary && (
                    <div className="bg-black/30 border border-white/5 rounded-lg px-3 py-2">
                      <div className="text-[9px] font-bold tracking-widest uppercase text-[#65f2b5] mb-1"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Last Report Summary
                      </div>
                      <p className="text-[12px] text-[#b9cacb] leading-relaxed"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {mem.reportSummary.length > 280 ? mem.reportSummary.slice(0, 280) + '…' : mem.reportSummary}
                      </p>
                    </div>
                  )}
                  {mem.keyFacts.length > 0 && (
                    <div>
                      <div className="text-[9px] font-bold tracking-widest uppercase text-[#849495] mb-2"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Key Facts
                      </div>
                      <FactsList facts={mem.keyFacts} />
                    </div>
                  )}
                </div>
              </div>

              {/* URL ledger */}
              {mem.seenUrls.length > 0 && (
                <div className="px-5 py-3 border-t border-white/5">
                  <SourceLedger urls={mem.seenUrls} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
