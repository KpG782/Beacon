'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './sidebar'
import TopBar from './topbar'

interface SidebarCtx { open: boolean; isMobile: boolean; toggle: () => void }
const SidebarContext = createContext<SidebarCtx>({ open: true, isMobile: false, toggle: () => {} })
export const useSidebar = () => useContext(SidebarContext)

export const SIDEBAR_OPEN_W  = 260
export const SIDEBAR_CLOSE_W = 64

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen]       = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('beacon:sidebar')
    if (saved === '0') setOpen(false)

    const mq = window.matchMedia('(max-width: 1023px)')
    setIsMobile(mq.matches)
    // Start closed on mobile
    if (mq.matches) setOpen(false)

    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (e.matches) setOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggle = () => setOpen(o => {
    const next = !o
    if (!isMobile) localStorage.setItem('beacon:sidebar', next ? '1' : '0')
    return next
  })

  if (pathname === '/') {
    return <>{children}</>
  }

  const ml = mounted && !isMobile ? (open ? SIDEBAR_OPEN_W : SIDEBAR_CLOSE_W) : 0

  return (
    <SidebarContext.Provider value={{ open, isMobile, toggle }}>
      <div className="flex min-h-screen bg-[#131314]">
        {/* Mobile backdrop */}
        {isMobile && open && (
          <div
            className="fixed inset-0 bg-black/70 z-30 lg:hidden"
            onClick={toggle}
            aria-hidden="true"
          />
        )}

        <Sidebar />

        <div
          className="flex-1 flex flex-col min-w-0"
          style={{ marginLeft: ml, transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}
        >
          <TopBar />
          <main className="flex-1 pt-16">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
