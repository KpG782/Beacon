'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './sidebar'
import TopBar from './topbar'

interface SidebarCtx { open: boolean; toggle: () => void }
const SidebarContext = createContext<SidebarCtx>({ open: true, toggle: () => {} })
export const useSidebar = () => useContext(SidebarContext)

export const SIDEBAR_OPEN_W  = 260
export const SIDEBAR_CLOSE_W = 64

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('beacon:sidebar')
    if (saved === '0') setOpen(false)
  }, [])

  const toggle = () => setOpen(o => {
    const next = !o
    localStorage.setItem('beacon:sidebar', next ? '1' : '0')
    return next
  })

  if (pathname === '/') {
    return <>{children}</>
  }

  const ml = mounted ? (open ? SIDEBAR_OPEN_W : SIDEBAR_CLOSE_W) : SIDEBAR_OPEN_W

  return (
    <SidebarContext.Provider value={{ open, toggle }}>
      <div className="flex min-h-screen bg-[#131314]">
        <Sidebar />
        <div
          className="flex-1 flex flex-col"
          style={{ marginLeft: ml, transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}
        >
          <TopBar />
          <main className="flex-1 pt-16">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
