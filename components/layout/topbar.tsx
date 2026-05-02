'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSidebar, SIDEBAR_OPEN_W, SIDEBAR_CLOSE_W } from './layout-shell'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogEntry {
  id: string; ts: string
  level: 'info' | 'warn' | 'error' | 'success'
  category: string; message: string
}

interface ServiceStatus {
  ok: boolean; label: string; href: string
}

interface BriefStatus {
  status: 'running' | 'sleeping' | 'complete' | 'failed'
}

type Panel = 'settings' | 'notif' | 'connections' | null

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LOG_ICON: Record<string, string> = {
  info: 'info', success: 'check_circle', warn: 'error_outline', error: 'warning',
}
const LOG_COLOR: Record<string, string> = {
  info: 'text-cyan-400', success: 'text-[#65f2b5]', warn: 'text-yellow-400', error: 'text-[#ffb4ab]',
}
const LOG_MSG_COLOR: Record<string, string> = {
  info: 'text-[#e5e2e3]', success: 'text-[#e5e2e3]', warn: 'text-yellow-300', error: 'text-[#ffb4ab]',
}

function PanelShell({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div
      className="absolute right-0 top-12 w-80 max-w-[calc(100vw-24px)] glass-card rounded-xl overflow-hidden shadow-2xl z-50"
      style={{ border: '1px solid rgba(255,255,255,0.12)' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#849495]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          {title}
        </span>
        {action}
      </div>
      {children}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TopBar() {
  const { open, toggle } = useSidebar()
  const [panel, setPanel]       = useState<Panel>(null)
  const [logs, setLogs]         = useState<LogEntry[]>([])
  const [unread, setUnread]     = useState(0)
  const [status, setStatus]     = useState<Record<string, ServiceStatus>>({})
  const [activeBriefs, setActiveBriefs] = useState(0)
  const containerRef            = useRef<HTMLDivElement>(null)
  const lastLogCount            = useRef(0)

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setPanel(null)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Load service status once
  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() => {})
  }, [])

  // Load active brief count
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/briefs')
        if (!res.ok) return
        const data: BriefStatus[] = await res.json()
        setActiveBriefs(data.filter(b => b.status === 'running').length)
      } catch {}
    }
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [])

  // Poll logs every 5 s
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/logs?limit=10')
        if (!res.ok) return
        const data: LogEntry[] = await res.json()
        setLogs(data)
        if (panel !== 'notif') {
          const newItems = data.length - lastLogCount.current
          if (newItems > 0) setUnread(u => u + newItems)
        } else {
          setUnread(0)
          lastLogCount.current = data.length
        }
        if (lastLogCount.current === 0) lastLogCount.current = data.length
      } catch {}
    }
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [panel])

  const openPanel = useCallback((p: Panel) => {
    setPanel(prev => prev === p ? null : p)
    if (p === 'notif') { setUnread(0); lastLogCount.current = logs.length }
  }, [logs.length])

  const connected     = Object.values(status).filter(s => s.ok).length
  const totalServices = Object.values(status).length
  const { isMobile }  = useSidebar()
  const leftOffset    = isMobile ? 0 : (open ? SIDEBAR_OPEN_W : SIDEBAR_CLOSE_W)

  return (
    <header
      className="fixed top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 h-16"
      style={{ left: leftOffset, right: 0, transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-5">
        <button onClick={toggle}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#849495] hover:text-cyan-400 hover:bg-white/5 transition-colors"
                aria-label="Toggle sidebar">
          <span className="material-symbols-outlined text-[22px]">{open ? 'menu_open' : 'menu'}</span>
        </button>
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
          totalServices > 0 && connected === totalServices ? 'text-[#65f2b5]' : 'text-cyan-400'
        }`}
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <span
            className={`w-2 h-2 rounded-full ${
              totalServices > 0 && connected === totalServices ? 'bg-[#65f2b5]' : 'bg-cyan-400'
            } ${connected > 0 ? 'pulse-cyan' : ''}`}
            style={{
              boxShadow: totalServices > 0 && connected === totalServices
                ? '0 0 8px rgba(101,242,181,0.7)'
                : '0 0 8px #00dbe9'
            }}
          />
          Services: {connected}/{totalServices || '—'} Online
        </div>
        <div className="text-slate-600 text-xs uppercase tracking-widest hidden lg:block"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Active Briefs: {activeBriefs}
        </div>
      </div>

      {/* Right — 3 buttons */}
      <div className="flex items-center gap-1 text-slate-500" ref={containerRef}>

        {/* ── 1. Settings ── */}
        <div className="relative">
          <button
            onClick={() => openPanel('settings')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg hover:text-cyan-300 hover:bg-white/5 transition-colors ${panel === 'settings' ? 'text-cyan-400 bg-white/5' : ''}`}
            aria-label="Settings"
            title="Settings"
          >
            <span className={`material-symbols-outlined text-[20px] ${panel === 'settings' ? 'icon-fill' : ''}`}>settings</span>
          </button>

          {panel === 'settings' && (
            <PanelShell title="Settings" action={
              <Link href="/docs" onClick={() => setPanel(null)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Open docs →
              </Link>
            }>
              <div className="p-4 flex flex-col gap-4">
                {/* App info */}
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-[#3b494b]"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>Application</div>
                  {[
                    { label: 'Version',    value: 'v1.0.0 — Hackathon Build' },
                    { label: 'Workflow',   value: '5 steps · durable' },
                    { label: 'Models',     value: 'llama-4-scout-17b + 3.3-70b' },
                    { label: 'Memory TTL', value: '30 days (Upstash Redis)' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-[12px]"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      <span className="text-[#849495]">{r.label}</span>
                      <span className="text-[#e5e2e3]">{r.value}</span>
                    </div>
                  ))}
                </div>
                {/* Quick links */}
                <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-[#3b494b] mb-1"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>Quick Links</div>
                  {[
                    { label: 'Research Graph', href: '/graph',      icon: 'hub' },
                    { label: 'System Logs',   href: '/logs',       icon: 'terminal' },
                    { label: 'Memory Bank',   href: '/memory',     icon: 'database' },
                    { label: 'Docs',          href: '/docs',       icon: 'menu_book' },
                    { label: 'Support',       href: '/support',    icon: 'contact_support' },
                    { label: 'MCP Guide',     href: '/docs#mcp',   icon: 'hub' },
                    { label: 'SDK Guide',     href: '/docs#sdk',   icon: 'code_blocks' },
                    { label: 'CLI Status',    href: '/docs#cli',   icon: 'terminal' },
                  ].map(l => (
                    <Link key={l.label} href={l.href}
                          onClick={() => setPanel(null)}
                          className="flex items-center gap-2 text-[12px] text-[#849495] hover:text-cyan-400 py-1 transition-colors"
                          style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      <span className="material-symbols-outlined text-[14px]">{l.icon}</span>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </PanelShell>
          )}
        </div>

        {/* ── 2. Notifications ── */}
        <div className="relative">
          <button
            onClick={() => openPanel('notif')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg hover:text-cyan-300 hover:bg-white/5 transition-colors relative ${panel === 'notif' ? 'text-cyan-400 bg-white/5' : ''}`}
            aria-label="Activity notifications"
            title="Recent Activity"
          >
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-[#ffb4ab] text-[#002022] text-[9px] font-black flex items-center justify-center px-1"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
            <span className="material-symbols-outlined text-[20px]">notifications_active</span>
          </button>

          {panel === 'notif' && (
            <PanelShell title="Recent Activity" action={
              <Link href="/logs" onClick={() => setPanel(null)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                All logs →
              </Link>
            }>
              {logs.length === 0 ? (
                <div className="px-4 py-8 text-center text-[12px] text-[#849495]"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  No activity yet. Start a research brief.
                </div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto">
                  {logs.map(entry => (
                    <div key={entry.id}
                         className={`flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${entry.level === 'error' ? 'bg-[#ffb4ab]/5' : ''}`}>
                      <span className={`material-symbols-outlined text-[15px] shrink-0 mt-0.5 ${LOG_COLOR[entry.level]}`}>
                        {LOG_ICON[entry.level]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] leading-snug ${LOG_MSG_COLOR[entry.level]}`}
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {entry.message}
                        </p>
                        <p className="text-[10px] text-[#3b494b] mt-0.5 font-mono">
                          {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          {' · '}{entry.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PanelShell>
          )}
        </div>

        {/* ── 3. Connections ── */}
        <div className="relative">
          <button
            onClick={() => openPanel('connections')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg hover:text-cyan-300 hover:bg-white/5 transition-colors relative ${panel === 'connections' ? 'text-cyan-400 bg-white/5' : ''}`}
            aria-label="Service connections"
            title="Connections"
          >
            {totalServices > 0 && connected < totalServices && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400" />
            )}
            <span className="material-symbols-outlined text-[20px]">account_tree</span>
          </button>

          {panel === 'connections' && (
            <PanelShell title="Connections" action={
              <span className="text-[11px] font-bold tracking-wider"
                    style={{ fontFamily: 'var(--font-space-grotesk)', color: connected === totalServices ? '#65f2b5' : '#ffb4ab' }}>
                {connected}/{totalServices} online
              </span>
            }>
              <div className="p-3 flex flex-col gap-1">
                {Object.entries(status).length === 0 ? (
                  <div className="py-4 text-center text-[12px] text-[#849495]"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Loading...
                  </div>
                ) : (
                  Object.entries(status).map(([, svc]) => (
                    <a key={svc.label} href={svc.href} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${svc.ok ? 'bg-[#65f2b5]' : 'bg-[#ffb4ab]'}`}
                            style={svc.ok ? { boxShadow: '0 0 6px rgba(101,242,181,0.5)' } : {}} />
                      <span className="flex-1 text-[13px] text-[#e5e2e3]"
                            style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {svc.label}
                      </span>
                      <span className={`text-[10px] font-bold tracking-wider uppercase ${svc.ok ? 'text-[#65f2b5]' : 'text-[#ffb4ab]'}`}
                            style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {svc.ok ? 'Connected' : 'Not set'}
                      </span>
                      <span className="material-symbols-outlined text-[13px] text-slate-700 group-hover:text-slate-400 transition-colors">
                        open_in_new
                      </span>
                    </a>
                  ))
                )}
              </div>
              <div className="px-4 py-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-[11px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Click a service to configure
                </span>
                <Link href="https://github.com/KpG782/Beacon#environment-variables" target="_blank"
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Env guide →
                </Link>
              </div>
            </PanelShell>
          )}
        </div>

      </div>
    </header>
  )
}
