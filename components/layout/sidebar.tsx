'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebar, SIDEBAR_OPEN_W, SIDEBAR_CLOSE_W } from './layout-shell'

const NAV = [
  { href: '/',           icon: 'home',       label: 'Landing' },
  { href: '/dashboard',  icon: 'dashboard',  label: 'Dashboard' },
  { href: '/briefs/new', icon: 'add_circle', label: 'New Research' },
  { href: '/graph',      icon: 'hub',        label: 'Research Graph' },
  { href: '/memory',     icon: 'database',   label: 'Memory Bank' },
  { href: '/logs',       icon: 'terminal',   label: 'System Logs' },
]

const FOOTER_NAV = [
  { href: '/docs',    icon: 'menu_book',       label: 'Docs' },
  { href: '/support', icon: 'contact_support', label: 'Support' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { open, isMobile, toggle } = useSidebar()

  // On mobile: full-width when open, hidden (0px) when closed.
  // On desktop: 260px open / 64px closed.
  const sidebarWidth = isMobile
    ? (open ? SIDEBAR_OPEN_W : 0)
    : (open ? SIDEBAR_OPEN_W : SIDEBAR_CLOSE_W)

  function handleNavClick() {
    if (isMobile && open) toggle()
  }

  return (
    <nav
      className="fixed left-0 top-0 h-full border-r border-white/5 bg-[#050505] flex flex-col py-6 z-40 overflow-hidden"
      style={{
        width: sidebarWidth,
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
      aria-label="Primary navigation"
    >
      {/* Brand + toggle */}
      <div
        className="flex items-center mb-8"
        style={{
          paddingLeft:    open ? 24 : 0,
          paddingRight:   open ? 8 : 0,
          justifyContent: open ? 'space-between' : 'center',
        }}
      >
        {open ? (
          <Link href="/" onClick={handleNavClick} className="flex items-center gap-3">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-cyan-400/20 flex items-center justify-center border border-cyan-400/30">
              <span className="material-symbols-outlined text-cyan-400 text-[18px]">adjust</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-cyan-400 leading-none"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}>BEACON</h1>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#849495] mt-0.5"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>AI AGENT v1.0</p>
            </div>
          </Link>
        ) : (
          <Link href="/" className="w-8 h-8 shrink-0 rounded-lg bg-cyan-400/20 flex items-center justify-center border border-cyan-400/30">
            <span className="material-symbols-outlined text-cyan-400 text-[18px]">adjust</span>
          </Link>
        )}
        {open && (
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#849495] hover:text-cyan-400 hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
            aria-label="Collapse sidebar"
          >
            <span className="material-symbols-outlined text-[18px]">menu_open</span>
          </button>
        )}
      </div>

      {/* New Brief CTA */}
      <div className="mb-6" style={{ paddingLeft: open ? 16 : 8, paddingRight: open ? 16 : 8 }}>
        {open ? (
          <Link
            href="/briefs/new"
            onClick={handleNavClick}
            className="w-full btn-ghost-cyan rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest uppercase min-h-[44px]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Brief
          </Link>
        ) : (
          <Link
            href="/briefs/new"
            className="w-full btn-ghost-cyan rounded-lg flex items-center justify-center min-h-[44px]"
            title="New Brief"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </Link>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col gap-0.5">
        {NAV.map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleNavClick}
              title={!open ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 py-3 text-[14px] transition-all duration-150 min-h-[44px] cursor-pointer',
                open ? 'px-4' : 'px-0 justify-center',
                isActive
                  ? 'bg-cyan-400/10 text-cyan-400 border-r-2 border-cyan-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
              {open && <span>{item.label}</span>}
            </Link>
          )
        })}
      </div>

      {/* Footer nav */}
      <div className="flex flex-col gap-0.5 border-t border-white/5 pt-3">
        {FOOTER_NAV.map(item => (
          <Link
            key={item.label}
            href={item.href}
            onClick={handleNavClick}
            title={!open ? item.label : undefined}
            className={cn(
              'flex items-center gap-3 py-2.5 text-[14px] text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all min-h-[44px] cursor-pointer',
              open ? 'px-4' : 'px-0 justify-center'
            )}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
            {open && <span>{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* User + expand toggle when collapsed */}
      <div
        className={cn(
          'pt-4 mt-2 border-t border-white/5 flex items-center gap-3',
          open ? 'px-6' : 'px-0 justify-center flex-col gap-2'
        )}
      >
        <div className="w-8 h-8 shrink-0 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-cyan-400 text-[16px]">person</span>
        </div>
        {open && (
          <div className="text-[11px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Op. ID: 884-A
          </div>
        )}
        {!open && (
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#849495] hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Expand sidebar"
          >
            <span className="material-symbols-outlined text-[18px]">menu</span>
          </button>
        )}
      </div>
    </nav>
  )
}
