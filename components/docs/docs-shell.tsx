'use client'

import Link from 'next/link'

export interface DocsNavItem {
  href: string
  label: string
}

export interface TocItem {
  id: string
  label: string
}

export function DocsShell({
  eyebrow,
  title,
  description,
  navItems,
  tocItems,
  actions,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  navItems: DocsNavItem[]
  tocItems?: TocItem[]
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#e5e2e3] overflow-clip">
      <div className="absolute inset-0 pointer-events-none landing-noise opacity-35" />
      <div className="absolute inset-x-0 top-0 h-[26rem] pointer-events-none neural-backdrop opacity-70" />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <div className="sticky top-4 z-50 mb-8 flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-[#0b0d10]/80 px-6 py-4 backdrop-blur-xl">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.2em] text-[#9db0b3] transition-colors hover:text-cyan-300"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Back to landing
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/support"
              className="border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#d7e2e4] transition-colors hover:bg-white/5"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Support
            </Link>
            <Link
              href="/trial"
              className="bg-cyan-400 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#002022] transition-colors hover:bg-cyan-300"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Try Beacon
            </Link>
          </div>
        </div>

        <div className="border border-cyan-400/15 bg-cyan-400/[0.04] p-8">
          <div
            className="text-[11px] uppercase tracking-[0.24em] text-cyan-300"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {eyebrow}
          </div>
          <h1 className="mt-4 max-w-5xl text-4xl tracking-[-0.04em] text-[#f3f7f8] md:text-5xl">{title}</h1>
          <p
            className="mt-4 max-w-4xl text-[15px] leading-7 text-[#9fb0b3]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {description}
          </p>
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        <div className={`mt-8 grid gap-6 ${tocItems && tocItems.length > 0 ? 'lg:grid-cols-[240px_minmax(0,1fr)_200px]' : 'lg:grid-cols-[280px_minmax(0,1fr)]'}`}>
          <aside className="h-fit rounded-2xl border border-white/8 bg-black/25 p-4 backdrop-blur-md lg:sticky lg:top-[6.5rem]">
            <div
              className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#8ea1a5]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Documentation
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border border-white/8 bg-white/[0.02] px-3 py-3 text-[12px] text-[#d3dcde] transition-colors hover:border-cyan-400/25 hover:text-cyan-300"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>

          <div className="flex flex-col gap-6">{children}</div>

          {tocItems && tocItems.length > 0 && (
            <aside className="hidden lg:block h-fit rounded-2xl border border-white/8 bg-black/25 p-4 backdrop-blur-md sticky top-[6.5rem]">
              <div
                className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#8ea1a5]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Quick Links
              </div>
              <div className="flex flex-col gap-2">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
                      window.history.pushState(null, '', `#${item.id}`)
                    }}
                    className="text-[12px] text-[#92a5a8] transition-colors hover:text-cyan-300"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

export function DocsSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  const sectionId = id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <section id={sectionId} className="border border-white/8 bg-black/25 p-6 backdrop-blur-sm scroll-mt-28">
      <div
        className="text-[10px] uppercase tracking-[0.22em] text-cyan-300"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {eyebrow}
      </div>
      <h2 className="mt-3 text-2xl tracking-[-0.03em] text-[#eef3f4]">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  )
}

export function DocsCard({
  title,
  body,
  href,
}: {
  title: string
  body: string
  href?: string
}) {
  const content = (
    <>
      <div className="text-[16px] text-[#eef3f4]">{title}</div>
      <p className="mt-2 text-[12px] leading-6 text-[#92a5a8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        {body}
      </p>
    </>
  )

  if (!href) {
    return <div className="border border-white/8 bg-black/20 p-4">{content}</div>
  }

  return (
    <Link href={href} className="border border-white/8 bg-black/20 p-4 transition-colors hover:border-cyan-400/25">
      {content}
    </Link>
  )
}

export function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto border border-white/8 bg-black/30 p-4 text-[12px] leading-6 text-[#d3dddf]">
      <code style={{ fontFamily: 'var(--font-space-grotesk)' }}>{children}</code>
    </pre>
  )
}

export const DOCS_NAV: DocsNavItem[] = [
  { href: '/docs', label: 'Overview' },
  { href: '/docs/quickstart', label: 'Quickstart' },
  { href: '/docs/api', label: 'API Reference' },
  { href: '/docs/mcp', label: 'MCP Guide' },
  { href: '/docs/authentication', label: 'Authentication' },
  { href: '/docs/rate-limits', label: 'Rate Limits' },
  { href: '/docs/security', label: 'Security' },
  { href: '/docs/deployment', label: 'Deployment' },
  { href: '/docs/architecture', label: 'Architecture' },
  { href: '/docs/roadmap', label: 'Roadmap' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/disclaimer', label: 'Disclaimer' },
]
