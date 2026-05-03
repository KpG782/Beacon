'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface RunSummary {
  runAt: string
  runCount: number
  urlsAdded: number
  factsAdded: number
  summary: string
}

interface MemoryEntry {
  topic: string
  runCount: number
  lastRunAt: string
  seenUrls: string[]
  keyFacts: string[]
  factSources?: string[]
  reportSummary: string
  runs?: RunSummary[]
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
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
              onClick={() => setExpanded((e) => !e)}
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
                <div className="text-[11px] text-cyan-400 truncate"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {host}
                </div>
                <div className="text-[10px] text-[#849495] break-all"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
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

function FactsList({ facts, factSources }: { facts: string[]; factSources?: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? facts : facts.slice(0, 6)

  return (
    <div>
      <ol className="flex flex-col gap-2">
        {visible.map((fact, i) => {
          const src = factSources?.[i]
          let host = ''
          if (src) {
            try { host = new URL(src).hostname.replace('www.', '') } catch {}
          }

          return (
            <li key={i} className="flex gap-2 text-[12px]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="text-[#65f2b5] shrink-0">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <span className="text-[#b9cacb]">{fact}</span>
                {host && (
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[10px] text-[#3b494b] hover:text-cyan-400 transition-colors mt-0.5 truncate"
                  >
                    via {host}
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      {facts.length > 6 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 mt-2 transition-colors"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {expanded ? '↑ Show less' : `+ ${facts.length - 6} more facts`}
        </button>
      )}
    </div>
  )
}

function RunHistory({ runs }: { runs: RunSummary[] }) {
  return (
    <div className="flex flex-col gap-0">
      {[...runs].reverse().map((run, i) => (
        <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
          <div className="flex flex-col items-center shrink-0 mt-1">
            <div className="w-2 h-2 rounded-full bg-[#65f2b5]" />
            {i < runs.length - 1 && <div className="w-px h-full bg-white/5 mt-1" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-bold text-[#e5e2e3]"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Run #{run.runCount}
              </span>
              <span className="text-[10px] text-[#3b494b]"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {new Date(run.runAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[10px] text-cyan-400"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                +{run.urlsAdded} URLs
              </span>
              <span className="text-[10px] text-[#ddb7ff]"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {run.factsAdded} facts
              </span>
            </div>
            {run.summary && (
              <p className="text-[11px] text-[#849495] mt-0.5"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {run.summary}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MemoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const router = useRouter()
  const [memory, setMemory] = useState<MemoryEntry | null>(null)
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { slug } = await params
        if (cancelled) return
        setSlug(slug)

        const res = await fetch(`/api/memory/${slug}`)
        if (!res.ok) {
          setMemory(null)
          return
        }
        const data = await res.json()
        if (!cancelled) setMemory(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [params])

  async function handleDelete() {
    if (!memory) return
    if (!confirm('Delete this memory? The next research run for this topic will start from scratch.')) return

    setDeleting(true)
    await fetch('/api/memory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: memory._key }),
    })
    router.push('/memory')
  }

  function exportMemory() {
    if (!memory) return
    const data = {
      topic: memory.topic,
      runCount: memory.runCount,
      lastRunAt: memory.lastRunAt,
      reportSummary: memory.reportSummary,
      keyFacts: memory.keyFacts.map((fact, i) => ({ fact, source: memory.factSources?.[i] ?? '' })),
      seenUrls: memory.seenUrls,
      runs: memory.runs ?? [],
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beacon-memory-${slug}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-card rounded-xl p-12 text-center text-[#849495] text-sm">
          Loading memory entry...
        </div>
      </div>
    )
  }

  if (!memory) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-[#849495] text-sm mb-4">Memory entry not found.</p>
          <Link href="/memory" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
            Back to Memory Bank
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex items-center gap-2 text-[12px] text-[#849495] mb-8"
           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
        <span className="text-[#3b494b]">/</span>
        <Link href="/memory" className="hover:text-cyan-400 transition-colors">Memory Bank</Link>
        <span className="text-[#3b494b]">/</span>
        <span className="text-[#e5e2e3] truncate">{memory.topic}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-[#e5e2e3] mb-1">{memory.topic}</h2>
          <p className="text-[13px] text-[#849495] truncate" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {memory._key}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/graph?topic=${encodeURIComponent(memory.topic)}`}
            className="text-[11px] text-[#65f2b5] hover:text-[#8af7c6] transition-colors flex items-center gap-1 min-h-[36px] px-2"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <span className="material-symbols-outlined text-[14px]">hub</span>
            Graph
          </Link>
          <Link
            href={`/briefs/new?topic=${encodeURIComponent(memory.topic)}`}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 min-h-[36px] px-2"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <span className="material-symbols-outlined text-[14px]">replay</span>
            Re-run
          </Link>
          <button
            onClick={exportMemory}
            className="text-[11px] text-[#849495] hover:text-[#e5e2e3] transition-colors flex items-center gap-1 min-h-[36px] px-2"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[11px] text-slate-600 hover:text-[#ffb4ab] transition-colors flex items-center gap-1 min-h-[36px] px-2"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <span className="material-symbols-outlined text-[16px]">
              {deleting ? 'progress_activity' : 'delete'}
            </span>
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
        {[
          { label: 'Run Count', value: `${memory.runCount} run${memory.runCount !== 1 ? 's' : ''}` },
          { label: 'Last Run', value: new Date(memory.lastRunAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
          { label: 'URLs Indexed', value: `${memory.seenUrls.length} sources` },
          { label: 'Facts Stored', value: `${memory.keyFacts.length} extracted` },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-xl p-5">
            <div className="text-[10px] font-bold tracking-widest uppercase text-[#849495] mb-2"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {item.label}
            </div>
            <div className="text-[16px] text-[#e5e2e3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 mb-5">
        <div className="glass-card rounded-xl p-5">
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#65f2b5] mb-2"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Last Report Summary
          </div>
          <p className="text-[12px] text-[#b9cacb] leading-relaxed"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {memory.reportSummary || 'No report summary stored yet.'}
          </p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#849495] mb-2"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Run History
          </div>
          {memory.runs && memory.runs.length > 0 ? (
            <RunHistory runs={memory.runs} />
          ) : (
            <p className="text-[12px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              No per-run timeline stored yet.
            </p>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-5 mb-5">
        <div className="text-[10px] font-bold tracking-widest uppercase text-[#849495] mb-3"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Key Facts {memory.factSources?.some(Boolean) ? '(with source attribution)' : ''}
        </div>
        {memory.keyFacts.length > 0 ? (
          <FactsList facts={memory.keyFacts} factSources={memory.factSources} />
        ) : (
          <p className="text-[12px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            No facts stored yet.
          </p>
        )}
      </div>

      <div className="glass-card rounded-xl p-5">
        <SourceLedger urls={memory.seenUrls} />
      </div>
    </div>
  )
}
