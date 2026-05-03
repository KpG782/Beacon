'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
}

interface RunLog {
  id: string
  ts: string
  level: 'info' | 'warn' | 'error' | 'success'
  category: string
  message: string
  runId?: string
}

const LIFECYCLE = [
  { id: 'accepted', label: 'Accepted',    icon: 'inbox' },
  { id: 'running',  label: 'Executing',   icon: 'radar' },
  { id: 'report',   label: 'Report Ready', icon: 'description' },
  { id: 'memory',   label: 'Memory Synced', icon: 'save' },
]

const STATUS_BADGE: Record<string, string> = {
  running:  'badge-active',
  sleeping: 'badge-sleeping',
  complete: 'badge-complete',
  failed:   'badge-failed',
}

const LOADING_PHASES = [
  {
    id: 'intake',
    label: 'Accepting brief',
    detail: 'Beacon validates the topic and prepares the workflow shell.',
    duration: 4000,
  },
  {
    id: 'memory',
    label: 'Checking memory',
    detail: 'Looking for prior runs, source ledgers, and known facts for this topic.',
    duration: 7000,
  },
  {
    id: 'queries',
    label: 'Planning queries',
    detail: 'Expanding the topic into targeted searches and arranging the initial graph.',
    duration: 9000,
  },
  {
    id: 'search',
    label: 'Building source mesh',
    detail: 'Fanning out searches and assembling candidate source nodes.',
    duration: 13000,
  },
  {
    id: 'report',
    label: 'Synthesizing report',
    detail: 'Compressing findings into the final brief and preparing citations.',
    duration: 16000,
  },
  {
    id: 'memory-sync',
    label: 'Syncing memory',
    detail: 'Saving new facts so the next run can operate in delta mode.',
    duration: 8000,
  },
] as const

function lifecycleState(stepId: string, data: BriefStatus | null) {
  if (!data) return 'pending'

  if (data.status === 'failed') {
    if (stepId === 'accepted') return 'done'
    if (stepId === 'running') return 'failed'
    return 'pending'
  }

  if (stepId === 'accepted') return 'done'
  if (stepId === 'running') {
    return data.status === 'running' || data.status === 'sleeping' ? 'active' : 'done'
  }
  if (stepId === 'report') return data.report ? 'done' : 'pending'
  if (stepId === 'memory') return data.status === 'complete' ? 'done' : 'pending'
  return 'pending'
}

function SourceRow({ src, isNew }: { src: Source; isNew: boolean }) {
  let host = src.url
  try { host = new URL(src.url).hostname.replace('www.', '') } catch {}
  const safe = src.url.startsWith('http://') || src.url.startsWith('https://')
  return (
    <a
      href={safe ? src.url : '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex gap-3 p-3 border transition-colors group ${
        isNew
          ? 'border-cyan-400/20 bg-cyan-400/[0.03] hover:border-cyan-400/40'
          : 'border-white/5 bg-black/20 hover:border-white/10'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {isNew && (
            <span className="text-[9px] font-bold tracking-widest uppercase text-cyan-400 px-1.5 py-0.5 border border-cyan-400/30"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}>new</span>
          )}
          <span className="text-[12px] text-cyan-400 group-hover:text-cyan-300 transition-colors truncate"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {src.title || host}
          </span>
        </div>
        <div className="text-[10px] text-[#849495] truncate font-mono mb-1">{host}</div>
        {src.snippet && (
          <div className="text-[11px] text-[#849495] line-clamp-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {src.snippet}
          </div>
        )}
      </div>
      <span className="material-symbols-outlined text-[14px] text-slate-700 group-hover:text-slate-400 transition-colors shrink-0 mt-0.5">
        open_in_new
      </span>
    </a>
  )
}

function LoadingStage({
  data,
  logs,
}: {
  data: BriefStatus | null
  logs: RunLog[]
}) {
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = window.setInterval(() => setElapsedMs(Date.now() - start), 800)
    return () => window.clearInterval(id)
  }, [])

  const totalDuration = LOADING_PHASES.reduce((sum, phase) => sum + phase.duration, 0)
  let consumed = 0
  let activePhaseIndex = LOADING_PHASES.length - 1
  for (let i = 0; i < LOADING_PHASES.length; i++) {
    consumed += LOADING_PHASES[i].duration
    if (elapsedMs < consumed) {
      activePhaseIndex = i
      break
    }
  }

  const activePhase = LOADING_PHASES[activePhaseIndex]
  const progress = Math.min(0.96, Math.max(0.08, elapsedMs / totalDuration))
  const nodeCount = Math.min(12, 2 + Math.floor(progress * 14))
  const visibleLogs = logs.slice(0, 5)

  return (
    <div className="border border-white/10 bg-[#0b0d10] min-h-[72vh] overflow-hidden relative">
      <div className="absolute inset-0 opacity-30"
           style={{
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
             backgroundSize: '28px 28px',
           }} />
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl bg-cyan-400/10" />
      <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full blur-3xl bg-[#65f2b5]/10" />

      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] min-h-[72vh]">
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
          <div className="max-w-3xl mb-8">
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-cyan-400 mb-3"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Research In Progress
            </div>
            <h3 className="text-[26px] sm:text-[34px] leading-tight text-[#e5e2e3] mb-3">
              Building the research mesh for {data?.topic ?? 'your topic'}.
            </h3>
            <p className="text-[13px] sm:text-[14px] text-[#849495] max-w-2xl"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Beacon is not streaming final prose yet, so this view shows live workflow activity, estimated stage progress,
              and the graph-like build-up of the run while synthesis is still underway.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_280px] gap-6 flex-1">
            <div className="border border-white/10 bg-black/20 p-5 sm:p-6 flex flex-col justify-between min-h-[380px]">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#849495]"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Live Construction
                  </div>
                  <div className="text-[12px] text-[#3b494b] mt-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Simulated node build based on observed workflow progression
                  </div>
                </div>
                <div className="text-[11px] text-cyan-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {Math.round(progress * 100)}%
                </div>
              </div>

              <div className="relative flex-1 min-h-[280px] border border-white/5 bg-[#07090c] overflow-hidden">
                <div className="absolute inset-0">
                  {Array.from({ length: nodeCount }).map((_, i) => {
                    const x = 14 + ((i * 17) % 68)
                    const y = 18 + ((i * 23) % 60)
                    const delay = `${i * 0.18}s`
                    const size = i === 0 ? 30 : i < 4 ? 18 : 12
                    const color = i === 0 ? '#f97316' : i < activePhaseIndex + 3 ? '#00dbe9' : '#65f2b5'
                    return (
                      <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${size}px`,
                          height: `${size}px`,
                          transform: 'translate(-50%, -50%)',
                          border: `1px solid ${color}55`,
                          background: `${color}22`,
                          boxShadow: `0 0 18px ${color}33`,
                          animation: `pulse-cyan 1.8s ease-in-out ${delay} infinite`,
                        }}
                      />
                    )
                  })}

                  {Array.from({ length: Math.max(0, nodeCount - 1) }).map((_, i) => {
                    const x = 18 + ((i * 17) % 64)
                    const y = 22 + ((i * 19) % 54)
                    const width = 70 + ((i * 13) % 130)
                    const angle = -26 + (i % 6) * 10
                    return (
                      <div
                        key={`line-${i}`}
                        className="absolute h-px bg-cyan-400/20"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${width}px`,
                          transform: `rotate(${angle}deg)`,
                          transformOrigin: 'left center',
                        }}
                      />
                    )
                  })}
                </div>

                <div className="absolute left-4 top-4 text-[10px] text-[#849495]"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  query nodes • source nodes • memory sync
                </div>
                <div className="absolute right-4 bottom-4 text-[10px] text-cyan-400"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {nodeCount} nodes staged
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[10px] text-[#849495] mb-2"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  <span>Observed progress</span>
                  <span>{activePhase.label}</span>
                </div>
                <div className="h-2 border border-white/10 bg-black/30 overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all duration-700" style={{ width: `${progress * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="border border-white/10 bg-black/20 p-5">
                <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#849495] mb-3"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Current Stage
                </div>
                <div className="text-[16px] text-[#e5e2e3] mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {activePhase.label}
                </div>
                <p className="text-[12px] text-[#849495] leading-relaxed"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {activePhase.detail}
                </p>
              </div>

              <div className="border border-white/10 bg-black/20 p-5">
                <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#849495] mb-3"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Workflow Steps
                </div>
                <div className="flex flex-col gap-3">
                  {LOADING_PHASES.map((phase, i) => {
                    const state =
                      i < activePhaseIndex ? 'done' :
                      i === activePhaseIndex ? 'active' :
                      'pending'
                    return (
                      <div key={phase.id} className="flex items-start gap-3">
                        <div className={`w-6 h-6 border flex items-center justify-center shrink-0 ${
                          state === 'done'
                            ? 'border-[#65f2b5]/40 bg-[#65f2b5]/10 text-[#65f2b5]'
                            : state === 'active'
                              ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-400'
                              : 'border-white/10 text-[#3b494b]'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {state === 'done' ? 'check' : state === 'active' ? 'progress_activity' : 'circle'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className={`text-[12px] ${state === 'pending' ? 'text-[#737373]' : 'text-[#e5e2e3]'}`}
                               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            {phase.label}
                          </div>
                          <div className="text-[10px] text-[#3b494b]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            {phase.detail}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border border-white/10 bg-black/20 p-5">
                <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#849495] mb-3"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Live Activity
                </div>
                {visibleLogs.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {visibleLogs.map((log) => (
                      <div key={log.id} className="border border-white/5 bg-black/20 px-3 py-2">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-[10px] text-cyan-400 uppercase tracking-[0.14em]"
                                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            {log.category}
                          </span>
                          <span className="text-[10px] text-[#3b494b]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            {new Date(log.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {log.message}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#737373]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Waiting for workflow telemetry...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BriefDetail() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<BriefStatus | null>(null)
  const [showQueries, setShowQueries] = useState(false)
  const [logs, setLogs] = useState<RunLog[]>([])

  useEffect(() => {
    let active = true
    const poll = async () => {
      try {
        const res = await fetch(`/api/briefs/${id}`)
        if (res.ok && active) {
          const json = await res.json()
          setData(json)
          if (json.status === 'complete' || json.status === 'failed') return
        }
      } catch { /* ignore transient errors */ }
      if (active) setTimeout(poll, 3000)
    }
    poll()
    return () => { active = false }
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

  const deltaSet = new Set(data?.deltaUrls ?? [])
  const newSources    = (data?.sources ?? []).filter(s => deltaSet.has(s.url))
  const knownSources  = (data?.sources ?? []).filter(s => !deltaSet.has(s.url))
  const hasDeltaData  = (data?.deltaUrls?.length ?? 0) > 0

  if (data?.status === 'running' && !data.report) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center gap-2 text-[#849495] text-[12px] mb-6"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/briefs" className="hover:text-cyan-400 transition-colors">All Briefs</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#e5e2e3] truncate max-w-[240px]">{data?.topic ?? id}</span>
        </div>
        <LoadingStage data={data} logs={logs} />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[#849495] text-[12px] mb-6"
           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/briefs" className="hover:text-cyan-400 transition-colors">All Briefs</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#e5e2e3] truncate max-w-[240px]">{data?.topic ?? id}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        {data ? (
          <>
            <div className="flex items-start gap-3 mb-2">
              <h2 className="text-2xl font-semibold text-[#e5e2e3] flex-1 leading-tight">{data.topic ?? id}</h2>
              <span
                className={`${STATUS_BADGE[data.status] ?? 'badge-sleeping'} text-[10px] px-2 py-1 rounded-sm font-bold tracking-wider shrink-0 mt-1`}
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {data.status === 'complete' && data.hasMemory ? 'Delta Found' : data.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-[11px] text-[#3b494b] font-mono">{id.slice(0, 16)}…</p>
              {(data.runCount ?? 0) > 0 && (
                <span className="text-[11px] text-cyan-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Run #{data.runCount}
                </span>
              )}
              {data.hasMemory && (
                <span className="badge-delta text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-wider"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  memory
                </span>
              )}
              {hasDeltaData && (
                <span className="text-[10px] text-cyan-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  +{data!.deltaUrls!.length} new sources
                </span>
              )}
            </div>
            {/* Quick-nav to graph and memory */}
            {data.status === 'complete' && data.topic && (
              <div className="flex items-center gap-3 mt-3">
                <Link
                  href={`/graph?runId=${id}`}
                  className="flex items-center gap-1.5 text-[11px] text-[#65f2b5] hover:text-[#8af7c6] transition-colors"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  <span className="material-symbols-outlined text-[14px]">hub</span>
                  View in Graph
                </Link>
                <span className="text-[#3b494b]">·</span>
                <Link
                  href={`/memory`}
                  className="flex items-center gap-1.5 text-[11px] text-[#ddb7ff] hover:text-[#e8d0ff] transition-colors"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  <span className="material-symbols-outlined text-[14px]">database</span>
                  Memory Bank
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="h-7 w-72 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
          </div>
        )}
      </div>

      {/* Pipeline */}
      <div className="glass-card rounded-xl p-5 mb-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 mb-4"
           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Observed Lifecycle
        </p>
        <div className="grid grid-cols-2 sm:flex gap-y-4 items-start">
          {LIFECYCLE.map((step, i) => {
            const state = lifecycleState(step.id, data)
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                    state === 'done'   ? 'bg-[#65f2b5]/15 border-[#65f2b5]/40' :
                    state === 'failed' ? 'bg-[#ffb4ab]/10 border-[#ffb4ab]/40' :
                    state === 'active' ? 'bg-cyan-400/15 border-cyan-400/50 pulse-cyan' :
                    'bg-white/5 border-white/10'
                  }`}>
                    <span className={`material-symbols-outlined text-[16px] ${
                      state === 'done'   ? 'text-[#65f2b5]' :
                      state === 'failed' ? 'text-[#ffb4ab]' :
                      state === 'active' ? 'text-cyan-400'  : 'text-slate-600'
                    }`}>
                      {state === 'done' ? 'check' : state === 'failed' ? 'close' : step.icon}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold tracking-wider uppercase text-center whitespace-nowrap ${
                    state === 'done'   ? 'text-[#65f2b5]' :
                    state === 'failed' ? 'text-[#ffb4ab]' :
                    state === 'active' ? 'text-cyan-400'  : 'text-slate-600'
                  }`} style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {step.label}
                  </span>
                </div>
                {i < LIFECYCLE.length - 1 && (
                  <div className="hidden sm:block w-6 h-px bg-white/10 shrink-0 mb-5 mx-0.5" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Query plan */}
      {data?.queryPlan && data.queryPlan.queries.length > 0 && (
        <div className="glass-card rounded-xl mb-4 overflow-hidden">
          <button
            onClick={() => setShowQueries(q => !q)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#849495]"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Query Plan
              </span>
              <span className="text-[10px] text-[#3b494b]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {data.queryPlan.queries.length} queries executed
              </span>
            </div>
            <span className={`material-symbols-outlined text-[16px] text-[#849495] transition-transform ${showQueries ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          {showQueries && (
            <div className="border-t border-white/5 divide-y divide-white/5">
              {data.queryPlan.queries.map((q, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3">
                  <span className="text-[10px] text-[#3b494b] font-mono shrink-0 mt-0.5 w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-[#e5e2e3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {q.q}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-[#849495] font-mono">{q.engine}</span>
                      {q.intent && (
                        <span className="text-[10px] text-[#3b494b]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {q.intent}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report */}
      {data?.status === 'complete' && data.report && (
        <div className="glass-card rounded-xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-cyan-400"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Research Report
            </p>
            {data.hasMemory && (
              <span className="badge-delta text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-wider"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                delta applied
              </span>
            )}
            {hasDeltaData && (
              <span className="text-[10px] text-cyan-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {newSources.length} new · {knownSources.length} known
              </span>
            )}
          </div>
          <div className="markdown-report text-[13px] text-[#e5e2e3]"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              disallowedElements={['script', 'iframe', 'object', 'embed', 'form', 'input']}
              unwrapDisallowed
              components={{
                a: ({ href, children, ...props }) => {
                  const safe = href?.startsWith('http') || href?.startsWith('https') || href?.startsWith('/')
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
      )}

      {/* Error */}
      {data?.status === 'failed' && (
        <div className="rounded-xl p-5 mb-4" style={{ border: '1px solid rgba(255,180,171,0.2)', background: 'rgba(255,180,171,0.05)' }}>
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#ffb4ab] mb-2"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Workflow Error
          </p>
          <p className="text-[13px] text-[#e5e2e3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {data.error ?? 'Workflow execution failed. Check system logs for details.'}
          </p>
        </div>
      )}

      {/* Sources — split new vs known */}
      {data?.sources && data.sources.length > 0 && (
        <div className="glass-card rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#849495]"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Sources ({data.sources.length})
            </p>
            {hasDeltaData && (
              <div className="flex items-center gap-3 text-[10px]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {newSources.length} new this run
                </span>
                <span className="text-[#3b494b]">{knownSources.length} previously known</span>
              </div>
            )}
          </div>

          {/* New sources section */}
          {hasDeltaData && newSources.length > 0 && (
            <div className="mb-4">
              <div className="text-[9px] font-bold tracking-widest uppercase text-cyan-400 mb-2 flex items-center gap-2"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
                New this run
              </div>
              <div className="flex flex-col gap-1.5">
                {newSources.map((src, i) => <SourceRow key={i} src={src} isNew />)}
              </div>
            </div>
          )}

          {/* Known sources section */}
          {hasDeltaData && knownSources.length > 0 && (
            <div>
              <div className="text-[9px] font-bold tracking-widest uppercase text-[#3b494b] mb-2 flex items-center gap-2"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                <span className="w-1 h-1 rounded-full bg-[#3b494b]" />
                Previously indexed
              </div>
              <div className="flex flex-col gap-1.5">
                {knownSources.map((src, i) => <SourceRow key={i} src={src} isNew={false} />)}
              </div>
            </div>
          )}

          {/* No delta data — show all sources flat */}
          {!hasDeltaData && (
            <div className="flex flex-col gap-1.5">
              {data.sources.map((src, i) => <SourceRow key={i} src={src} isNew={false} />)}
            </div>
          )}
        </div>
      )}

      {/* Running placeholder */}
      {data?.status === 'running' && !data.report && (
        <div className="glass-card rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-[40px] text-cyan-400 pulse-cyan block mb-3">radar</span>
          <p className="text-[13px] text-[#849495] mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Research in progress
          </p>
          <p className="text-[11px] text-[#3b494b]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Page polls automatically every 3 seconds
          </p>
        </div>
      )}
    </div>
  )
}
