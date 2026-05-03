'use client'

import Link from 'next/link'

const SYSTEM_LINES = [
  'MEMORY LAYER: UPSTASH REDIS',
  'SEARCH TOOL: SERPAPI',
  'MODELS: SCOUT + SYNTH',
  'WORKFLOW: DURABLE STEPS',
]

export function AuthShell({
  title,
  eyebrow,
  description,
  footerHref,
  footerLabel,
  children,
}: {
  title: string
  eyebrow: string
  description: string
  footerHref: string
  footerLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="grid min-h-screen lg:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="relative hidden border-r border-[#303030] bg-[#0a0a0a] lg:flex">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(rgba(38,38,38,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(38,38,38,0.9) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative flex min-h-screen w-full flex-col justify-between p-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <div
                  className="text-[11px] uppercase tracking-[0.28em] text-[#f97316]"
                  style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                >
                  {eyebrow}
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#fafafa]">{title}</h1>
                  <p className="max-w-sm text-base leading-7 text-[#d4d4d4]">{description}</p>
                </div>
              </div>

              <div className="border border-[#404040] bg-[#141414]">
                <div
                  className="border-b border-[#404040] px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-[#b3b3b3]"
                  style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                >
                  Beacon Runtime
                </div>
                <div className="space-y-0 px-4 py-2">
                  {SYSTEM_LINES.map((line) => (
                    <div
                      key={line}
                      className="flex items-center justify-between border-b border-[#262626] py-3 last:border-b-0"
                      style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                    >
                      <span className="text-[12px] text-[#f5f5f5]">{line}</span>
                      <span className="text-[11px] text-[#f97316]">READY</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-[11px] uppercase tracking-[0.22em] text-[#b3b3b3]">
              <div style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                Durable web research with persistent memory.
              </div>
              <Link
                href={footerHref}
                className="inline-flex border border-[#404040] px-3 py-2 text-[#f5f5f5] transition-colors hover:border-[#f97316] hover:text-[#f97316]"
                style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              >
                {footerLabel}
              </Link>
            </div>
          </div>
        </aside>

        <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(38,38,38,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(38,38,38,0.8) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative z-10 flex w-full max-w-md flex-col gap-6">
            <div className="space-y-3 lg:hidden">
              <div
                className="text-[11px] uppercase tracking-[0.28em] text-[#f97316]"
                style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              >
                {eyebrow}
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#fafafa]">{title}</h1>
                <p className="mt-2 text-base leading-7 text-[#d4d4d4]">{description}</p>
              </div>
            </div>

            {children}

            <p
              className="text-center text-[11px] uppercase tracking-[0.18em] text-[#b3b3b3]"
              style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
            >
              Beacon operator access
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
