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

export default function BriefDetail() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<BriefStatus | null>(null)

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

  return (
    <div className="px-8 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[#849495] text-[12px] mb-8"
           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#e5e2e3] truncate max-w-[300px]">{data?.topic ?? id}</span>
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
            <div className="flex items-center gap-4">
              <p className="text-[11px] text-[#3b494b] font-mono">{id}</p>
              {(data.runCount ?? 0) > 1 && (
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
            </div>
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
        <p
          className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 mb-4"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Observed Lifecycle
        </p>
        <div className="flex items-start">
          {LIFECYCLE.map((step, i) => {
            const state = lifecycleState(step.id, data)
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                      state === 'done'
                        ? 'bg-[#65f2b5]/15 border-[#65f2b5]/40'
                        : state === 'failed'
                        ? 'bg-[#ffb4ab]/10 border-[#ffb4ab]/40'
                        : state === 'active'
                        ? 'bg-cyan-400/15 border-cyan-400/50 pulse-cyan'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        state === 'done' ? 'text-[#65f2b5]' :
                        state === 'failed' ? 'text-[#ffb4ab]' :
                        state === 'active' ? 'text-cyan-400' :
                        'text-slate-600'
                      }`}
                    >
                      {state === 'done' ? 'check' : state === 'failed' ? 'close' : step.icon}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold tracking-wider uppercase text-center whitespace-nowrap ${
                      state === 'done' ? 'text-[#65f2b5]' :
                      state === 'failed' ? 'text-[#ffb4ab]' :
                      state === 'active' ? 'text-cyan-400' :
                      'text-slate-600'
                    }`}
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < LIFECYCLE.length - 1 && (
                  <div className="w-6 h-px bg-white/10 shrink-0 mb-5 mx-0.5" />
                )}
              </div>
            )
          })}
        </div>
        <p className="text-[11px] text-[#849495] mt-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Runtime status comes from the Workflow SDK. Step-by-step internals are not streamed to the UI.
        </p>
      </div>

      {/* Report */}
      {data?.status === 'complete' && data.report && (
        <div className="glass-card rounded-xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <p
              className="text-[10px] font-bold tracking-widest uppercase text-cyan-400"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Research Report
            </p>
            {data.hasMemory && (
              <span className="badge-delta text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-wider"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                delta applied
              </span>
            )}
          </div>
          <div
            className="markdown-report text-[13px] text-[#e5e2e3]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
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

      {/* Sources */}
      {data?.sources && data.sources.length > 0 && (
        <div className="glass-card rounded-xl p-5 mb-4">
          <p
            className="text-[10px] font-bold tracking-widest uppercase text-[#849495] mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Sources ({data.sources.length})
          </p>
          <div className="flex flex-col gap-3">
            {data.sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-0.5 group"
              >
                <span
                  className="text-[12px] text-cyan-400 group-hover:text-cyan-300 transition-colors truncate"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {src.title ?? src.url}
                </span>
                {src.snippet && (
                  <span
                    className="text-[11px] text-[#849495] line-clamp-2"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {src.snippet}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Running placeholder */}
      {data?.status === 'running' && !data.report && (
        <div className="glass-card rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-[40px] text-cyan-400 pulse-cyan block mb-3">
            radar
          </span>
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
