'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Brief {
  runId: string
  status: 'running' | 'sleeping' | 'complete' | 'failed'
  topic: string
  runCount: number
  hasMemory: boolean
  memoryFacts: number
  source: string
  recurring: boolean
  createdAt: string
}

const STATUS_BADGE: Record<string, string> = {
  running:  'badge-active',
  sleeping: 'badge-sleeping',
  complete: 'badge-complete',
  failed:   'badge-failed',
}
const STATUS_LABEL: Record<string, string> = {
  running:  'Active',
  sleeping: 'Sleeping',
  complete: 'Complete',
  failed:   'Failed',
}

const FEED_ICON: Record<string, string> = {
  running:  'trip_origin',
  complete: 'new_releases',
  sleeping: 'bedtime',
  failed:   'warning',
}
const FEED_COLOR: Record<string, string> = {
  running:  'text-cyan-400',
  complete: 'text-[#65f2b5]',
  sleeping: 'text-slate-500',
  failed:   'text-[#ffb4ab]',
}

function fmt(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function BriefCard({ brief }: { brief: Brief }) {
  const preview = brief.status === 'running'
    ? `Searching for new developments on "${brief.topic}" — run #${brief.runCount}`
    : brief.status === 'complete' && brief.hasMemory
    ? `Delta report ready — ${brief.memoryFacts} memory points applied. Changes since last run surfaced.`
    : brief.status === 'complete'
    ? `Initial report complete for "${brief.topic}" — ${brief.memoryFacts ?? 0} facts indexed.`
    : brief.status === 'failed'
    ? 'Workflow error. Check system logs for details.'
    : `Awaiting next scheduled run. ${brief.recurring ? 'Recurs in 7 days.' : ''}`

  return (
    <Link href={`/briefs/${brief.runId}`} className="glass-card rounded-xl p-0 flex flex-col hover:border-white/20 transition-all">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div
          className="text-[11px] font-bold tracking-widest uppercase text-[#e5e2e3] truncate pr-4"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {brief.topic}
        </div>
        <span
          className={`${STATUS_BADGE[brief.status] ?? 'badge-sleeping'} text-[10px] px-2 py-1 rounded-sm font-bold tracking-wider shrink-0`}
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {brief.status === 'complete' && brief.hasMemory ? 'Delta Found' : STATUS_LABEL[brief.status]}
        </span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <div
          className="text-[13px] text-[#b9cacb] bg-black/40 px-3 py-2 rounded border border-white/5 overflow-hidden"
          style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.5 }}
        >
          {brief.status === 'complete' && brief.hasMemory && (
            <span className="text-[#65f2b5] mr-2">DELTA PREVIEW:</span>
          )}
          {brief.status === 'running' && (
            <span className="text-cyan-400 mr-2">ACTIVE:</span>
          )}
          <span className="text-slate-400">{preview}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#849495] text-xs"
               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            <span className="material-symbols-outlined text-[14px]">psychology</span>
            {brief.source}
          </div>
          {brief.runCount > 1 && (
            <div className="flex items-center gap-1.5 text-[#849495] text-xs"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="material-symbols-outlined text-[14px]">replay</span>
              Run #{brief.runCount}
            </div>
          )}
          {brief.recurring && (
            <div className="flex items-center gap-1.5 text-[#849495] text-xs"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="material-symbols-outlined text-[14px]">autorenew</span>
              Recurring
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/briefs')
        if (res.ok) setBriefs(await res.json())
      } finally {
        setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [])

  const active = briefs.filter(b => b.status === 'running').length
  const memPts = briefs.reduce((s, b) => s + (b.memoryFacts ?? 0), 0)
  const withMem = briefs.filter(b => b.hasMemory).length
  const deltaScore = briefs.length > 0 ? (withMem / briefs.length).toFixed(2) : '0.00'

  const feedEntries = [...briefs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return (
    <div className="px-8 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-[#e5e2e3] mb-1">Command Overview</h2>
          <p className="text-[13px] text-[#849495]"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            System diagnostics and active research subroutines.
          </p>
        </div>
        <Link
          href="/briefs/new"
          className="btn-ghost-cyan rounded-lg py-2.5 px-6 flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase min-h-[44px]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
          Deploy New Agent
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {[
          { icon: 'auto_awesome_motion', iconColor: 'text-cyan-400', label: 'Active Briefs', value: loading ? '—' : `${active}`, sub: `/${briefs.length}` },
          { icon: 'memory', iconColor: 'text-[#65f2b5]', label: 'Total Memory Points', value: loading ? '—' : fmt(memPts), sub: '' },
          { icon: 'timeline', iconColor: 'text-[#ddb7ff]', label: 'Avg Delta Score', value: loading ? '—' : deltaScore, sub: '' },
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className={`material-symbols-outlined text-[64px] ${stat.iconColor}`}>{stat.icon}</span>
            </div>
            <div
              className="text-[11px] font-bold tracking-widest uppercase text-[#849495] mb-4 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${stat.iconColor.replace('text-', 'bg-')}`} />
              {stat.label}
            </div>
            <div className="text-5xl font-bold text-[#e5e2e3]">
              {stat.value}
              {stat.sub && <span className="text-2xl font-semibold text-[#849495] ml-1">{stat.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3
              className="text-[11px] font-bold tracking-widest uppercase text-[#849495]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Primary Briefs Queue
            </h3>
            <Link
              href="/briefs/new"
              className="text-[12px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              New <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="glass-card rounded-xl p-8 text-center text-[#849495] text-sm">Loading...</div>
          ) : briefs.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-700 mb-3 block">search</span>
              <p className="text-[#849495] text-sm">No research briefs yet.</p>
              <Link href="/briefs/new" className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block">
                Deploy your first agent →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {briefs.slice(0, 5).map(brief => (
                <BriefCard key={brief.runId} brief={brief} />
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">
          <h3
            className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-2"
            style={{ fontFamily: 'var(--font-space-grotesk)', color: '#849495' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] pulse-cyan" />
            Live Activity Stream
          </h3>
          <div className="glass-card rounded-xl flex flex-col overflow-hidden" style={{ maxHeight: 560 }}>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-[#849495] text-xs">Loading stream...</div>
              ) : feedEntries.length === 0 ? (
                <div className="px-4 py-8 text-center text-[#849495] text-xs">No activity yet.</div>
              ) : (
                feedEntries.map((b) => (
                  <Link
                    key={b.runId}
                    href={`/briefs/${b.runId}`}
                    className={`px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors flex gap-3 ${b.status === 'complete' && b.hasMemory ? 'bg-[#65f2b5]/5' : ''}`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <span className={`material-symbols-outlined text-[14px] ${FEED_COLOR[b.status]}`}>
                        {FEED_ICON[b.status]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      <div className="text-[#849495] text-[11px] mb-1">
                        {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <div className={`text-[12px] leading-relaxed truncate ${FEED_COLOR[b.status]}`}>
                        {b.status === 'running' && `Agent: Researching "${b.topic}" — run #${b.runCount}`}
                        {b.status === 'complete' && b.hasMemory && `Delta found: "${b.topic}" — memory applied`}
                        {b.status === 'complete' && !b.hasMemory && `Report ready: "${b.topic}"`}
                        {b.status === 'sleeping' && `Sleeping: "${b.topic}" — resumes in 7d`}
                        {b.status === 'failed' && `Failed: "${b.topic}" — workflow error`}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <div className="p-3 border-t border-white/10 bg-black/20 flex items-center justify-between">
              <span
                className="text-[11px] text-[#849495]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Polling every 5s
              </span>
              <span className="text-[11px] text-cyan-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {briefs.length} runs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
