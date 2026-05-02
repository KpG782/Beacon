'use client'

import { useEffect, useRef, useState } from 'react'

interface LogEntry {
  id: string
  ts: string
  level: 'info' | 'warn' | 'error' | 'success'
  category: 'workflow' | 'memory' | 'serpapi' | 'groq' | 'system'
  message: string
  runId?: string
}

const LEVEL_COLOR: Record<string, string> = {
  info:    'text-cyan-400',
  success: 'text-[#65f2b5]',
  warn:    'text-yellow-400',
  error:   'text-[#ffb4ab]',
}
const LEVEL_BG: Record<string, string> = {
  info:    'bg-cyan-400/10 text-cyan-400',
  success: 'bg-[#65f2b5]/10 text-[#65f2b5]',
  warn:    'bg-yellow-400/10 text-yellow-400',
  error:   'bg-[#ffb4ab]/10 text-[#ffb4ab]',
}
const CAT_ICON: Record<string, string> = {
  workflow: 'account_tree',
  memory:   'memory',
  serpapi:  'search',
  groq:     'psychology',
  system:   'settings',
}
const CAT_COLOR: Record<string, string> = {
  workflow: 'text-cyan-400',
  memory:   'text-[#65f2b5]',
  serpapi:  'text-[#ddb7ff]',
  groq:     'text-yellow-400',
  system:   'text-slate-400',
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [level, setLevel] = useState('')
  const [category, setCategory] = useState('')
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function load() {
    if (paused) return
    const params = new URLSearchParams()
    if (level)    params.set('level', level)
    if (category) params.set('category', category)
    params.set('limit', '200')
    try {
      const res = await fetch(`/api/logs?${params}`)
      if (res.ok) setLogs(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [level, category])
  useEffect(() => {
    if (paused) return
    const id = setInterval(load, 2000)
    return () => clearInterval(id)
  }, [paused, level, category])

  const counts = {
    info:    logs.filter(l => l.level === 'info').length,
    success: logs.filter(l => l.level === 'success').length,
    warn:    logs.filter(l => l.level === 'warn').length,
    error:   logs.filter(l => l.level === 'error').length,
  }

  return (
    <div className="px-8 py-8 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-semibold text-[#e5e2e3] mb-1">System Logs</h2>
          <p className="text-[13px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Real-time agent event stream — workflow steps, memory operations, API calls.
          </p>
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          className={`rounded-lg py-2 px-4 text-[11px] font-bold tracking-widest uppercase min-h-[44px] flex items-center gap-2 transition-all ${
            paused ? 'btn-ghost-cyan' : 'bg-white/5 border border-white/10 text-[#849495] hover:text-[#e5e2e3]'
          }`}
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <span className="material-symbols-outlined text-[16px]">{paused ? 'play_arrow' : 'pause'}</span>
          {paused ? 'Resume Stream' : 'Pause Stream'}
        </button>
      </div>

      {/* Level counts */}
      <div className="flex items-center gap-3 mb-4 shrink-0 flex-wrap">
        {(['', 'info', 'success', 'warn', 'error'] as const).map(l => (
          <button
            key={l || 'all'}
            onClick={() => setLevel(l)}
            className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg transition-all ${
              level === l
                ? l === '' ? 'bg-white/10 text-[#e5e2e3]' : `${LEVEL_BG[l]} border border-current/30`
                : 'text-[#849495] hover:text-[#e5e2e3] hover:bg-white/5'
            }`}
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {l === '' ? `All (${logs.length})` : `${l} (${counts[l]})`}
          </button>
        ))}
        <div className="h-4 w-px bg-white/10 mx-1" />
        {(['', 'workflow', 'memory', 'serpapi', 'groq', 'system'] as const).map(c => (
          <button
            key={c || 'all-cat'}
            onClick={() => setCategory(c)}
            className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              category === c
                ? 'bg-white/10 text-[#e5e2e3]'
                : 'text-slate-600 hover:text-[#849495] hover:bg-white/5'
            }`}
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {c !== '' && <span className={`material-symbols-outlined text-[12px] ${CAT_COLOR[c]}`}>{CAT_ICON[c]}</span>}
            {c === '' ? 'All' : c}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {!paused && (
            <span className="flex items-center gap-1.5 text-[11px] text-cyan-400"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-cyan" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Log terminal */}
      <div className="glass-card rounded-xl flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="px-4 py-2 border-b border-white/10 flex items-center gap-3 bg-black/20 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ffb4ab]/40" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/40" />
            <div className="w-3 h-3 rounded-full bg-[#65f2b5]/40" />
          </div>
          <span className="text-[11px] text-[#849495] font-mono">beacon — system log</span>
        </div>

        <div className="flex-1 overflow-y-auto font-mono text-[12px]">
          {loading ? (
            <div className="px-4 py-8 text-center text-[#849495]">Initializing log stream...</div>
          ) : logs.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#849495]">No log entries match current filters.</div>
          ) : (
            logs.map(entry => (
              <div
                key={entry.id}
                className={`flex items-start gap-3 px-4 py-2 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${
                  entry.level === 'error' ? 'bg-[#ffb4ab]/5' :
                  entry.level === 'warn'  ? 'bg-yellow-400/5' :
                  entry.level === 'success' && entry.category === 'memory' ? 'bg-[#65f2b5]/5' : ''
                }`}
              >
                <span className="text-[#3b494b] shrink-0 text-[10px] pt-0.5 w-20 tabular-nums">
                  {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={`shrink-0 material-symbols-outlined text-[14px] pt-0.5 ${CAT_COLOR[entry.category]}`}>
                  {CAT_ICON[entry.category]}
                </span>
                <span className={`shrink-0 text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded ${LEVEL_BG[entry.level]}`}
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {entry.level}
                </span>
                <span className={`flex-1 leading-relaxed ${LEVEL_COLOR[entry.level] === 'text-cyan-400' ? 'text-[#e5e2e3]' : LEVEL_COLOR[entry.level]}`}>
                  {entry.message}
                </span>
                {entry.runId && (
                  <span className="text-[10px] text-[#3b494b] shrink-0 truncate max-w-[120px]">
                    {entry.runId.slice(-8)}
                  </span>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}
