'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PublicSearchResult {
  href: string
  title: string
  snippet: string
}

export default function PublicDocsSearch() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<PublicSearchResult[]>([])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setSearching(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        setSearching(true)
        const res = await fetch(`/api/public-search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        if (!res.ok) {
          setResults([])
          return
        }
        const body = await res.json()
        setResults(Array.isArray(body.results) ? body.results : [])
      } catch {
        if (!controller.signal.aborted) setResults([])
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 180)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  const hasQuery = query.trim().length >= 2
  const canShowDropdown = open && (hasQuery || searching)

  const topHref = useMemo(() => (results[0]?.href ? results[0].href : '/docs'), [results])

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.push(topHref)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative hidden lg:block mr-2">
      <form onSubmit={onSubmit}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search docs..."
          className="w-56 border border-white/10 bg-black/20 px-3 py-2 pr-8 text-[11px] text-[#c7d4d6] placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-cyan-400">
          <Search size={14} />
        </button>
      </form>

      {canShowDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] border border-white/10 bg-[#0b0d10] shadow-2xl">
          {searching ? (
            <div className="px-3 py-2 text-[11px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Searching public docs…
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-[11px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              No matching docs.
            </div>
          ) : (
            <div className="max-h-80 overflow-auto">
              {results.map((result) => (
                <Link
                  key={`${result.href}-${result.title}`}
                  href={result.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/5 px-3 py-2.5 transition-colors last:border-b-0 hover:bg-white/[0.04]"
                >
                  <div className="text-[12px] text-[#e5e2e3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {result.title}
                  </div>
                  {result.snippet && (
                    <div className="text-[10px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {result.snippet}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
