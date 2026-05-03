'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ── Types ────────────────────────────────────────────────────────────────────

interface Source {
  url: string
  title?: string
  snippet?: string
}

interface QueryEntry {
  q: string
  engine: string
  intent: string
}

interface BriefStatus {
  runId: string
  status: 'running' | 'sleeping' | 'complete' | 'failed'
  topic?: string
  runCount?: number
  hasMemory?: boolean
  report?: string
  sources?: Source[]
  currentStep?: string
  error?: string
  deltaUrls?: string[]
  queryPlan?: { queries: QueryEntry[] }
  frameworkId?: string
  recurring?: boolean
}

interface RunLog {
  id: string
  ts: string
  level: 'info' | 'warn' | 'error' | 'success'
  category: string
  message: string
  runId?: string
}

type Tab = 'report' | 'sources' | 'plan'

// ── Constants ────────────────────────────────────────────────────────────────

const LIFECYCLE = [
  { id: 'accepted', label: 'Accepted',      icon: 'inbox' },
  { id: 'running',  label: 'Executing',     icon: 'radar' },
  { id: 'report',   label: 'Report Ready',  icon: 'description' },
  { id: 'memory',   label: 'Memory Synced', icon: 'save' },
]

const STATUS_BADGE: Record<string, string> = {
  running:  'badge-active',
  sleeping: 'badge-sleeping',
  complete: 'badge-complete',
  failed:   'badge-failed',
}

const LOADING_PHASES = [
  { id: 'intake',      label: 'Accepting brief',      detail: 'Beacon validates the topic and prepares the workflow shell.', duration: 4000 },
  { id: 'memory',      label: 'Checking memory',       detail: 'Looking for prior runs, source ledgers, and known facts for this topic.', duration: 7000 },
  { id: 'queries',     label: 'Planning queries',      detail: 'Expanding the topic into targeted searches and arranging the initial graph.', duration: 9000 },
  { id: 'search',      label: 'Building source mesh',  detail: 'Fanning out searches and assembling candidate source nodes.', duration: 13000 },
  { id: 'report',      label: 'Synthesizing report',   detail: 'Compressing findings into the final brief and preparing citations.', duration: 16000 },
  { id: 'memory-sync', label: 'Syncing memory',        detail: 'Saving new facts so the next run can operate in delta mode.', duration: 8000 },
] as const

// ── Helpers ──────────────────────────────────────────────────────────────────

function lifecycleState(stepId: string, data: BriefStatus | null) {
  if (!data) return 'pending'
  if (data.status === 'failed') {
    if (stepId === 'accepted') return 'done'
    if (stepId === 'running') return 'failed'
    return 'pending'
  }
  if (stepId === 'accepted') return 'done'
  if (stepId === 'running')  return data.status === 'running' || data.status === 'sleeping' ? 'active' : 'done'
  if (stepId === 'report')   return data.report ? 'done' : 'pending'
  if (stepId === 'memory')   return data.status === 'complete' ? 'done' : 'pending'
  return 'pending'
}

function hostname(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length
}

function readingTime(text: string) {
  return Math.max(1, Math.ceil(wordCount(text) / 200))
}

// ── Loading stage (full-screen while running) ────────────────────────────────

function LoadingStage({ data, logs }: { data: BriefStatus | null; logs: RunLog[] }) {
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = window.setInterval(() => setElapsedMs(Date.now() - start), 800)
    return () => window.clearInterval(id)
  }, [])

  const totalDuration = LOADING_PHASES.reduce((s, p) => s + p.duration, 0)
  let consumed = 0
  let activeIdx = LOADING_PHASES.length - 1
  for (let i = 0; i < LOADING_PHASES.length; i++) {
    consumed += LOADING_PHASES[i].duration
    if (elapsedMs < consumed) { activeIdx = i; break }
  }

  const activePhase = LOADING_PHASES[activeIdx]
  const progress    = Math.min(0.96, Math.max(0.08, elapsedMs / totalDuration))
  const nodeCount   = Math.min(12, 2 + Math.floor(progress * 14))
  const visibleLogs = logs.slice(0, 5)

  return (
    <div className="border border-white/10 bg-[#0b0d10] min-h-[78vh] overflow-hidden relative">
      <div className="absolute inset-0 opacity-20"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl bg-cyan-400/10" />
      <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full blur-3xl bg-[#65f2b5]/10" />

      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] min-h-[78vh]">
        {/* Main visualization */}
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
          <div className="mb-8">
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-cyan-400 mb-3"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>Research In Progress</div>
            <h3 className="text-[24px] sm:text-[32px] leading-tight text-[#e5e2e3] mb-3">
              Building the research mesh for <span className="text-cyan-400">{data?.topic ?? 'your topic'}</span>.
            </h3>
            <p className="text-[13px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Live workflow execution — this view shows stage progress and source node build-up while synthesis is underway.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_260px] gap-6 flex-1">
            {/* Node visualization */}
            <div className="border border-white/10 bg-black/20 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#849495]"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>Live Construction</div>
                <div className="text-[11px] text-cyan-400 tabular-nums">{Math.round(progress * 100)}%</div>
              </div>
              <div className="relative flex-1 min-h-[260px] border border-white/5 bg-[#07090c] overflow-hidden">
                <div className="absolute inset-0">
                  {Array.from({ length: nodeCount }).map((_, i) => {
                    const x = 14 + ((i * 17) % 68)
                    const y = 18 + ((i * 23) % 60)
                    const size = i === 0 ? 28 : i < 4 ? 16 : 11
                    const color = i === 0 ? '#f97316' : i < activeIdx + 3 ? '#00dbe9' : '#65f2b5'
                    return (
                      <div key={i} className="absolute rounded-full"
                           style={{ left: `${x}%`, top: `${y}%`, width: size, height: size,
                                    transform: 'translate(-50%,-50%)', border: `1px solid ${color}55`,
                                    background: `${color}22`, boxShadow: `0 0 14px ${color}33`,
                                    animation: `pulse-cyan 1.8s ease-in-out ${i * 0.18}s infinite` }} />
                    )
                  })}
                  {Array.from({ length: Math.max(0, nodeCount - 1) }).map((_, i) => (
                    <div key={`l${i}`} className="absolute h-px bg-cyan-400/15"
                         style={{ left: `${18 + ((i * 17) % 64)}%`, top: `${22 + ((i * 19) % 54)}%`,
                                  width: 70 + ((i * 13) % 130), transform: `rotate(${-26 + (i % 6) * 10}deg)`,
                                  transformOrigin: 'left center' }} />
                  ))}
                </div>
                <div className="absolute left-3 top-3 text-[9px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  query nodes · source nodes · memory sync
                </div>
                <div className="absolute right-3 bottom-3 text-[9px] text-cyan-400 tabular-nums" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {nodeCount} nodes staged
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] text-[#849495] mb-1.5"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  <span>Progress</span><span>{activePhase.label}</span>
                </div>
                <div className="h-1.5 border border-white/10 bg-black/30 overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all duration-700" style={{ width: `${progress * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Stage + logs */}
            <div className="flex flex-col gap-4">
              <div className="border border-white/10 bg-black/20 p-4">
                <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#849495] mb-2"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>Current Stage</div>
                <div className="text-[15px] text-[#e5e2e3] mb-1.5" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {activePhase.label}
                </div>
                <p className="text-[11px] text-[#849495] leading-relaxed" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {activePhase.detail}
                </p>
              </div>

              <div className="border border-white/10 bg-black/20 p-4 flex-1">
                <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#849495] mb-3"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>Steps</div>
                <div className="flex flex-col gap-2.5">
                  {LOADING_PHASES.map((phase, i) => {
                    const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending'
                    return (
                      <div key={phase.id} className="flex items-start gap-2.5">
                        <div className={`w-5 h-5 border flex items-center justify-center shrink-0 mt-0.5 ${
                          state === 'done'   ? 'border-[#65f2b5]/40 bg-[#65f2b5]/10 text-[#65f2b5]'
                        : state === 'active' ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-400'
                        :                      'border-white/10 text-[#3b494b]'
                        }`}>
                          <span className="material-symbols-outlined text-[12px]">
                            {state === 'done' ? 'check' : state === 'active' ? 'progress_activity' : 'circle'}
                          </span>
                        </div>
                        <span className={`text-[11px] leading-tight ${state === 'pending' ? 'text-[#737373]' : 'text-[#e5e2e3]'}`}
                              style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {phase.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {visibleLogs.length > 0 && (
                <div className="border border-white/10 bg-black/20 p-4">
                  <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#849495] mb-2"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>Live Activity</div>
                  <div className="flex flex-col gap-1.5">
                    {visibleLogs.map(log => (
                      <div key={log.id} className="text-[10px] text-[#849495] flex gap-2"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        <span className="text-cyan-400 shrink-0 uppercase">{log.category}</span>
                        <span className="truncate">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Source card ──────────────────────────────────────────────────────────────

function SourceCard({ src, isNew, index }: { src: Source; isNew: boolean; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const host = hostname(src.url)
  const safe = src.url.startsWith('http')

  function copyUrl(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    navigator.clipboard.writeText(src.url).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className={`border transition-colors group ${
      isNew ? 'border-cyan-400/20 bg-cyan-400/[0.02] hover:border-cyan-400/35'
             : 'border-[#262626] bg-black/10 hover:border-white/10'
    }`}>
      {/* Header row */}
      <div className="flex items-start gap-3 p-3.5">
        <div className="text-[10px] text-[#3b494b] font-mono w-5 shrink-0 mt-0.5 tabular-nums">{index + 1}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            {isNew && (
              <span className="text-[9px] font-bold tracking-widest uppercase text-cyan-400 px-1.5 py-0.5 border border-cyan-400/30 shrink-0">
                new
              </span>
            )}
            <a href={safe ? src.url : '#'} target="_blank" rel="noopener noreferrer"
               className="text-[12px] text-cyan-400 hover:text-cyan-300 transition-colors truncate leading-tight">
              {src.title || host}
            </a>
          </div>
          <div className="text-[10px] text-[#849495] font-mono truncate">{host}</div>
          {src.snippet && !expanded && (
            <div className="text-[11px] text-[#737373] line-clamp-2 mt-1 leading-relaxed"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {src.snippet}
            </div>
          )}
          {src.snippet && expanded && (
            <div className="text-[11px] text-[#849495] mt-1 leading-relaxed"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {src.snippet}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {src.snippet && (
            <button onClick={() => setExpanded(e => !e)}
                    className="w-7 h-7 flex items-center justify-center border border-white/10 text-[#849495] hover:text-[#e5e2e3] hover:border-white/20 transition-colors"
                    title={expanded ? 'Collapse' : 'Expand snippet'}>
              <span className="material-symbols-outlined text-[13px]">{expanded ? 'unfold_less' : 'unfold_more'}</span>
            </button>
          )}
          <button onClick={copyUrl}
                  className="w-7 h-7 flex items-center justify-center border border-white/10 text-[#849495] hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
                  title="Copy URL">
            <span className="material-symbols-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
          </button>
          <a href={safe ? src.url : '#'} target="_blank" rel="noopener noreferrer"
             className="w-7 h-7 flex items-center justify-center border border-white/10 text-[#849495] hover:text-[#e5e2e3] hover:border-white/20 transition-colors"
             title="Open in new tab">
            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function BriefDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [data, setData]       = useState<BriefStatus | null>(null)
  const [logs, setLogs]       = useState<RunLog[]>([])
  const [tab, setTab]         = useState<Tab>('report')
  const [srcFilter, setSrcFilter] = useState<'all' | 'new' | 'known'>('all')
  const [srcSearch, setSrcSearch] = useState('')
  const [copied, setCopied]   = useState<string | null>(null)
  const [rerunning, setRerunning] = useState(false)
  const activeRef = useRef(true)

  // ── Polling ────────────────────────────────────────────────────────────────

  useEffect(() => {
    activeRef.current = true
    const poll = async () => {
      try {
        const res = await fetch(`/api/briefs/${id}`)
        if (res.ok && activeRef.current) {
          const json: BriefStatus = await res.json()
          setData(json)
          if (json.status === 'complete' || json.status === 'failed') return
        }
      } catch {}
      if (activeRef.current) setTimeout(poll, 3000)
    }
    poll()
    return () => { activeRef.current = false }
  }, [id])

  useEffect(() => {
    let active = true
    const pollLogs = async () => {
      try {
        const res = await fetch(`/api/logs?limit=8&runId=${id}`)
        if (res.ok && active) setLogs(await res.json())
      } catch {}
      if (active && data?.status === 'running') setTimeout(pollLogs, 3000)
    }
    pollLogs()
    return () => { active = false }
  }, [id, data?.status])

  // ── Actions ────────────────────────────────────────────────────────────────

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label); setTimeout(() => setCopied(null), 2000)
    })
  }

  function exportMd() {
    if (!data?.report) return
    const slug = (data.topic ?? 'report').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
    const blob = new Blob([data.report], { type: 'text/markdown' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${slug}.md`; a.click()
    URL.revokeObjectURL(url)
  }

  async function runAgain() {
    if (!data?.topic || rerunning) return
    setRerunning(true)
    try {
      let userKeys: Record<string, string> | undefined
      try {
        const stored = window.localStorage.getItem('beacon:user:keys')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.groqApiKey || parsed.serpApiKey) userKeys = parsed
        }
      } catch {}
      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: data.topic, source: 'dashboard', userKeys }),
      })
      if (res.ok) {
        const { runId } = await res.json()
        router.push(`/briefs/${runId}`)
      }
    } catch {}
    setRerunning(false)
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const deltaSet    = new Set(data?.deltaUrls ?? [])
  const allSources  = data?.sources ?? []
  const newSources  = allSources.filter(s => deltaSet.has(s.url))
  const knownSources = allSources.filter(s => !deltaSet.has(s.url))
  const hasDelta    = (data?.deltaUrls?.length ?? 0) > 0
  const wc          = data?.report ? wordCount(data.report) : 0
  const rt          = data?.report ? readingTime(data.report) : 0

  function filteredSources() {
    const base = srcFilter === 'new' ? newSources : srcFilter === 'known' ? knownSources : allSources
    if (!srcSearch.trim()) return base
    const q = srcSearch.toLowerCase()
    return base.filter(s =>
      s.url.toLowerCase().includes(q) ||
      (s.title ?? '').toLowerCase().includes(q) ||
      (s.snippet ?? '').toLowerCase().includes(q)
    )
  }

  // ── Loading state (running, no report yet) ─────────────────────────────────

  if (data?.status === 'running' && !data.report) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-[#849495] text-[12px] flex-shrink-0"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/briefs" className="hover:text-cyan-400 transition-colors">All Briefs</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#e5e2e3] truncate max-w-[260px]">{data?.topic ?? id}</span>
        </div>
        <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-6">
          <LoadingStage data={data} logs={logs} />
        </div>
      </div>
    )
  }

  // ── Skeleton (no data yet) ─────────────────────────────────────────────────

  if (!data) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-4">
        <div className="h-4 w-48 bg-white/5 animate-pulse" />
        <div className="h-8 w-96 bg-white/5 animate-pulse" />
        <div className="h-4 w-72 bg-white/5 animate-pulse" />
        <div className="h-64 bg-white/5 animate-pulse mt-4" />
      </div>
    )
  }

  // ── Complete / failed view ─────────────────────────────────────────────────

  const allSourcesForCopy = allSources.map(s => s.url).join('\n')
  const filtSrcs = filteredSources()

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-3 border-b border-[#262626] bg-[#0a0a0a] sticky top-0 z-20">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#849495] mb-3"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <Link href="/briefs" className="hover:text-cyan-400 transition-colors">All Briefs</Link>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-[#e5e2e3] truncate max-w-[280px]">{data.topic ?? id}</span>
        </div>

        {/* Title row */}
        <div className="flex items-start gap-3 mb-2 flex-wrap">
          <h1 className="text-[20px] sm:text-[24px] font-semibold text-[#e5e2e3] flex-1 leading-tight min-w-0">
            {data.topic ?? id}
          </h1>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <span className={`${STATUS_BADGE[data.status] ?? 'badge-sleeping'} text-[9px] px-2 py-1 font-bold tracking-wider`}
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {data.status === 'complete' && data.hasMemory ? 'DELTA' : data.status.toUpperCase()}
            </span>
            {(data.runCount ?? 0) > 0 && (
              <span className="text-[10px] text-cyan-400 border border-cyan-400/20 px-2 py-1"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Run #{data.runCount}
              </span>
            )}
            {data.hasMemory && (
              <span className="badge-delta text-[9px] px-2 py-1 font-bold tracking-wider"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                memory
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        {data.status === 'complete' && (
          <div className="flex items-center gap-4 text-[11px] text-[#849495] mb-3 flex-wrap"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {allSources.length > 0 && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">link</span>
                {allSources.length} sources
              </span>
            )}
            {hasDelta && newSources.length > 0 && (
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="material-symbols-outlined text-[13px]">add_circle</span>
                {newSources.length} new this run
              </span>
            )}
            {wc > 0 && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">article</span>
                {wc.toLocaleString()} words · {rt} min read
              </span>
            )}
            {data.queryPlan && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">search</span>
                {data.queryPlan.queries.length} queries
              </span>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {data.report && (
            <>
              <ActionBtn
                icon="content_copy"
                label={copied === 'report' ? 'Copied!' : 'Copy Report'}
                active={copied === 'report'}
                onClick={() => copy(data.report!, 'report')}
              />
              <ActionBtn icon="download" label="Export .md" onClick={exportMd} />
            </>
          )}
          <ActionBtn
            icon="share"
            label={copied === 'url' ? 'Copied!' : 'Copy URL'}
            active={copied === 'url'}
            onClick={() => copy(window.location.href, 'url')}
          />
          {allSources.length > 0 && (
            <ActionBtn
              icon="format_list_bulleted"
              label={copied === 'urls' ? 'Copied!' : 'Copy All URLs'}
              active={copied === 'urls'}
              onClick={() => copy(allSourcesForCopy, 'urls')}
            />
          )}
          {data.status === 'complete' && (
            <ActionBtn
              icon={rerunning ? 'progress_activity' : 'refresh'}
              label={rerunning ? 'Starting...' : 'Run Again'}
              onClick={runAgain}
              spin={rerunning}
            />
          )}
          {data.status === 'complete' && data.topic && (
            <>
              <Link href={`/graph?runId=${id}`}>
                <ActionBtn icon="hub" label="View Graph" asChild />
              </Link>
              <Link href="/memory">
                <ActionBtn icon="database" label="Memory Bank" asChild />
              </Link>
            </>
          )}
        </div>

        {/* Tab strip */}
        <div className="flex gap-0 mt-4 -mb-3 border-b border-[#262626]">
          {([
            { key: 'report',  label: 'Report',        count: null },
            { key: 'sources', label: 'Sources',        count: allSources.length || null },
            { key: 'plan',    label: 'Research Plan',  count: data.queryPlan?.queries.length || null },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold tracking-wider uppercase border-b-2 transition-colors -mb-px ${
                tab === t.key
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-[#849495] hover:text-[#e5e2e3]'
              }`}
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {t.label}
              {t.count != null && (
                <span className={`text-[9px] px-1.5 py-0.5 ${
                  tab === t.key ? 'bg-cyan-400/15 text-cyan-400' : 'bg-white/5 text-[#737373]'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">

        {/* ── REPORT TAB ── */}
        {tab === 'report' && (
          <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">

            {/* Sidebar */}
            <div className="xl:sticky xl:top-[168px] flex flex-col gap-3">

              {/* Lifecycle */}
              <div className="border border-[#262626] bg-[#111111] p-4">
                <div className="text-[9px] font-bold tracking-widest uppercase text-[#849495] mb-3"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>Lifecycle</div>
                <div className="flex flex-col gap-2">
                  {LIFECYCLE.map((step, i) => {
                    const state = lifecycleState(step.id, data)
                    return (
                      <div key={step.id} className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 border flex items-center justify-center shrink-0 ${
                          state === 'done'   ? 'border-[#65f2b5]/40 bg-[#65f2b5]/10'
                        : state === 'failed' ? 'border-[#ffb4ab]/40 bg-[#ffb4ab]/10'
                        : state === 'active' ? 'border-cyan-400/50 bg-cyan-400/10 pulse-cyan'
                        :                      'border-white/10'
                        }`}>
                          <span className={`material-symbols-outlined text-[12px] ${
                            state === 'done'   ? 'text-[#65f2b5]'
                          : state === 'failed' ? 'text-[#ffb4ab]'
                          : state === 'active' ? 'text-cyan-400'
                          :                      'text-[#3b494b]'
                          }`}>
                            {state === 'done' ? 'check' : state === 'failed' ? 'close' : step.icon}
                          </span>
                        </div>
                        <span className={`text-[11px] ${
                          state === 'done' ? 'text-[#65f2b5]' : state === 'active' ? 'text-cyan-400' : 'text-[#737373]'
                        }`} style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Delta summary */}
              {hasDelta && (
                <div className="border border-cyan-400/20 bg-cyan-400/[0.02] p-4">
                  <div className="text-[9px] font-bold tracking-widest uppercase text-cyan-400 mb-2"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>Delta Summary</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'New Sources',   value: newSources.length },
                      { label: 'Known Sources', value: knownSources.length },
                    ].map(item => (
                      <div key={item.label} className="border border-[#262626] bg-[#0a0a0a] px-3 py-2">
                        <div className="text-[18px] font-bold text-[#e5e2e3] tabular-nums">{item.value}</div>
                        <div className="text-[9px] text-[#849495] uppercase tracking-wider" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Run metadata */}
              <div className="border border-[#262626] bg-[#111111] p-4">
                <div className="text-[9px] font-bold tracking-widest uppercase text-[#849495] mb-3"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>Run Metadata</div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Mode',    value: data.hasMemory ? 'Delta' : 'Baseline' },
                    { label: 'Run',     value: `#${data.runCount ?? 1}` },
                    { label: 'Sources', value: allSources.length.toString() },
                    data.frameworkId ? { label: 'Framework', value: data.frameworkId } : null,
                    data.recurring   ? { label: 'Recurring', value: 'Weekly' }         : null,
                  ].filter(Boolean).map(item => item && (
                    <div key={item.label} className="flex justify-between items-baseline gap-2">
                      <span className="text-[10px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{item.label}</span>
                      <span className="text-[10px] text-[#e5e2e3] font-mono text-right truncate max-w-[120px]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick nav */}
              {data.status === 'complete' && data.topic && (
                <div className="flex flex-col gap-1.5">
                  <Link href={`/graph?runId=${id}`}
                        className="flex items-center gap-2 px-3 py-2 border border-[#262626] text-[11px] text-[#849495] hover:text-[#65f2b5] hover:border-[#65f2b5]/30 transition-colors"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    <span className="material-symbols-outlined text-[14px]">hub</span>
                    View in Graph
                  </Link>
                  <Link href="/memory"
                        className="flex items-center gap-2 px-3 py-2 border border-[#262626] text-[11px] text-[#849495] hover:text-[#ddb7ff] hover:border-[#ddb7ff]/30 transition-colors"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    <span className="material-symbols-outlined text-[14px]">database</span>
                    Memory Bank
                  </Link>
                </div>
              )}
            </div>

            {/* Report content */}
            <div className="min-w-0">
              {data.status === 'failed' && (
                <div className="border border-[#ffb4ab]/20 bg-[#ffb4ab]/5 p-5 mb-4">
                  <div className="text-[9px] font-bold tracking-widest uppercase text-[#ffb4ab] mb-2"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>Workflow Error</div>
                  <p className="text-[13px] text-[#e5e2e3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {data.error ?? 'Workflow execution failed. Check system logs for details.'}
                  </p>
                </div>
              )}

              {data.status === 'complete' && data.report && (
                <div className="border border-[#262626] bg-[#111111]">
                  {/* Report header */}
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[#262626]">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold tracking-widest uppercase text-cyan-400"
                            style={{ fontFamily: 'var(--font-space-grotesk)' }}>Research Report</span>
                      {data.hasMemory && (
                        <span className="badge-delta text-[9px] px-1.5 py-0.5 font-bold tracking-wider"
                              style={{ fontFamily: 'var(--font-space-grotesk)' }}>delta</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[#849495]"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      <span>{wc.toLocaleString()} words</span>
                      <span>·</span>
                      <span>{rt} min read</span>
                      <button
                        onClick={() => copy(data.report!, 'report')}
                        className="flex items-center gap-1 text-[#849495] hover:text-cyan-400 transition-colors"
                        title="Copy report markdown">
                        <span className="material-symbols-outlined text-[13px]">{copied === 'report' ? 'check' : 'content_copy'}</span>
                        <span>{copied === 'report' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                  {/* Report body */}
                  <div className="px-5 sm:px-8 py-6">
                    <div className="markdown-report text-[13px] text-[#e5e2e3]"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        disallowedElements={['script', 'iframe', 'object', 'embed', 'form', 'input']}
                        unwrapDisallowed
                        components={{
                          a: ({ href, children, ...props }) => {
                            const safe = href?.startsWith('http') || href?.startsWith('/')
                            return safe
                              ? <a {...props} href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                              : <span>{children}</span>
                          },
                        }}
                      >
                        {data.report}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {data.status === 'running' && (
                <div className="border border-[#262626] bg-[#111111] p-8 text-center">
                  <span className="material-symbols-outlined text-[36px] text-cyan-400 pulse-cyan block mb-3">radar</span>
                  <p className="text-[13px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Research in progress</p>
                  <p className="text-[11px] text-[#3b494b] mt-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Polling every 3 seconds</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SOURCES TAB ── */}
        {tab === 'sources' && (
          <div className="flex flex-col gap-4">
            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#849495] text-[16px]">search</span>
                <input
                  type="text"
                  value={srcSearch}
                  onChange={e => setSrcSearch(e.target.value)}
                  placeholder="Search sources by title, domain, or snippet…"
                  className="w-full bg-[#111111] border border-[#262626] text-[#e5e2e3] text-[12px] pl-9 pr-4 py-2.5 outline-none placeholder:text-[#4a4a4a] focus:border-cyan-400/40 transition-colors"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                />
              </div>

              <div className="flex">
                {(['all', 'new', 'known'] as const).map(f => (
                  <button key={f} onClick={() => setSrcFilter(f)}
                          className={`px-3 py-2.5 text-[10px] font-bold tracking-wider uppercase border transition-colors ${
                            srcFilter === f
                              ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400'
                              : 'border-[#262626] text-[#849495] hover:text-[#e5e2e3] -ml-px'
                          }`}
                          style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {f} {f === 'all' ? `(${allSources.length})` : f === 'new' ? `(${newSources.length})` : `(${knownSources.length})`}
                  </button>
                ))}
              </div>

              {allSources.length > 0 && (
                <button
                  onClick={() => copy(filtSrcs.map(s => s.url).join('\n'), 'urls')}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold tracking-wider uppercase border border-[#262626] text-[#849495] hover:text-[#e5e2e3] hover:border-white/20 transition-colors"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  <span className="material-symbols-outlined text-[13px]">{copied === 'urls' ? 'check' : 'content_copy'}</span>
                  {copied === 'urls' ? 'Copied!' : `Copy ${filtSrcs.length} URLs`}
                </button>
              )}
            </div>

            {/* Source list */}
            {filtSrcs.length === 0 ? (
              <div className="border border-[#262626] bg-[#111111] p-10 text-center">
                <span className="material-symbols-outlined text-[32px] text-[#3b494b] block mb-2">search_off</span>
                <p className="text-[13px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {srcSearch ? `No sources match "${srcSearch}"` : 'No sources yet'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-0 border border-[#262626] divide-y divide-[#1a1a1a]">
                {/* Section headers when showing all with delta data */}
                {srcFilter === 'all' && hasDelta ? (
                  <>
                    {newSources.filter(s => {
                      if (!srcSearch.trim()) return true
                      const q = srcSearch.toLowerCase()
                      return s.url.toLowerCase().includes(q) || (s.title ?? '').toLowerCase().includes(q) || (s.snippet ?? '').toLowerCase().includes(q)
                    }).length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-cyan-400/[0.03] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span className="text-[9px] font-bold tracking-widest uppercase text-cyan-400"
                                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            New this run — {newSources.length}
                          </span>
                        </div>
                        {newSources
                          .filter(s => !srcSearch.trim() || s.url.toLowerCase().includes(srcSearch.toLowerCase()) || (s.title ?? '').toLowerCase().includes(srcSearch.toLowerCase()) || (s.snippet ?? '').toLowerCase().includes(srcSearch.toLowerCase()))
                          .map((src, i) => <SourceCard key={src.url} src={src} isNew index={i} />)
                        }
                      </>
                    )}
                    {knownSources.filter(s => {
                      if (!srcSearch.trim()) return true
                      const q = srcSearch.toLowerCase()
                      return s.url.toLowerCase().includes(q) || (s.title ?? '').toLowerCase().includes(q) || (s.snippet ?? '').toLowerCase().includes(q)
                    }).length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-black/20 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3b494b] shrink-0" />
                          <span className="text-[9px] font-bold tracking-widest uppercase text-[#3b494b]"
                                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            Previously indexed — {knownSources.length}
                          </span>
                        </div>
                        {knownSources
                          .filter(s => !srcSearch.trim() || s.url.toLowerCase().includes(srcSearch.toLowerCase()) || (s.title ?? '').toLowerCase().includes(srcSearch.toLowerCase()) || (s.snippet ?? '').toLowerCase().includes(srcSearch.toLowerCase()))
                          .map((src, i) => <SourceCard key={src.url} src={src} isNew={false} index={i} />)
                        }
                      </>
                    )}
                  </>
                ) : (
                  filtSrcs.map((src, i) => (
                    <SourceCard key={src.url} src={src} isNew={deltaSet.has(src.url)} index={i} />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ── RESEARCH PLAN TAB ── */}
        {tab === 'plan' && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">

            {/* Query plan */}
            <div className="border border-[#262626] bg-[#111111]">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626]">
                <span className="text-[9px] font-bold tracking-widest uppercase text-[#849495]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}>Query Plan</span>
                {data.queryPlan && (
                  <button
                    onClick={() => copy(data.queryPlan!.queries.map(q => q.q).join('\n'), 'queries')}
                    className="flex items-center gap-1 text-[10px] text-[#849495] hover:text-cyan-400 transition-colors"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    <span className="material-symbols-outlined text-[13px]">{copied === 'queries' ? 'check' : 'content_copy'}</span>
                    {copied === 'queries' ? 'Copied' : 'Copy queries'}
                  </button>
                )}
              </div>

              {!data.queryPlan || data.queryPlan.queries.length === 0 ? (
                <div className="p-8 text-center text-[12px] text-[#849495]"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Query plan not available for this run.
                </div>
              ) : (
                <div className="divide-y divide-[#1a1a1a]">
                  {data.queryPlan.queries.map((q, i) => (
                    <div key={i} className="flex items-start gap-4 px-5 py-3.5 group hover:bg-white/[0.02] transition-colors">
                      <span className="text-[11px] text-[#3b494b] font-mono w-5 shrink-0 mt-0.5 tabular-nums">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-[#e5e2e3] mb-1 leading-snug"
                             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {q.q}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[9px] font-mono text-cyan-400/70 border border-cyan-400/20 px-1.5 py-0.5">
                            {q.engine}
                          </span>
                          {q.intent && (
                            <span className="text-[10px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                              {q.intent}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => copy(q.q, `q${i}`)}
                        className="w-7 h-7 flex items-center justify-center border border-white/10 text-[#849495] hover:text-cyan-400 hover:border-cyan-400/30 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        title="Copy query">
                        <span className="material-symbols-outlined text-[12px]">{copied === `q${i}` ? 'check' : 'content_copy'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Run config */}
            <div className="flex flex-col gap-3">
              <div className="border border-[#262626] bg-[#111111] p-4">
                <div className="text-[9px] font-bold tracking-widest uppercase text-[#849495] mb-3"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>Run Configuration</div>
                <div className="flex flex-col gap-2.5">
                  {[
                    { label: 'Run ID',    value: id.slice(0, 18) + '…', mono: true },
                    { label: 'Mode',      value: data.hasMemory ? 'Delta (memory loaded)' : 'Baseline (first run)' },
                    { label: 'Run #',     value: `${data.runCount ?? 1}` },
                    { label: 'Sources',   value: `${allSources.length} indexed` },
                    data.frameworkId ? { label: 'Framework', value: data.frameworkId } : null,
                    data.recurring   ? { label: 'Recurring', value: 'Every 7 days' } : null,
                  ].filter(Boolean).map(item => item && (
                    <div key={item.label} className="flex justify-between items-baseline gap-2">
                      <span className="text-[10px] text-[#849495] shrink-0" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {item.label}
                      </span>
                      <span className={`text-[10px] text-[#e5e2e3] text-right truncate max-w-[150px] ${item.mono ? 'font-mono' : ''}`}
                            style={!item.mono ? { fontFamily: 'var(--font-space-grotesk)' } : {}}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Re-run from this plan */}
              {data.status === 'complete' && (
                <button
                  onClick={runAgain}
                  disabled={rerunning}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-[#f97316] text-[#f97316] text-[10px] font-bold tracking-widest uppercase hover:bg-[#f97316]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  <span className={`material-symbols-outlined text-[15px] ${rerunning ? 'animate-spin' : ''}`}>
                    {rerunning ? 'progress_activity' : 'refresh'}
                  </span>
                  {rerunning ? 'Starting…' : 'Run Delta Research Again'}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Tiny action button ────────────────────────────────────────────────────────

function ActionBtn({
  icon, label, onClick, active, spin, asChild,
}: {
  icon: string
  label: string
  onClick?: () => void
  active?: boolean
  spin?: boolean
  asChild?: boolean
}) {
  const cls = `flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase border transition-colors ${
    active
      ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400'
      : 'border-[#262626] text-[#849495] hover:border-white/20 hover:text-[#e5e2e3]'
  }`
  const inner = (
    <>
      <span className={`material-symbols-outlined text-[13px] ${spin ? 'animate-spin' : ''}`}>{icon}</span>
      <span style={{ fontFamily: 'var(--font-space-grotesk)' }}>{label}</span>
    </>
  )
  if (asChild) return <div className={cls}>{inner}</div>
  return <button onClick={onClick} className={cls}>{inner}</button>
}
