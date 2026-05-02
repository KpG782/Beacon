import Link from 'next/link'
import ArchitectureScene from '@/components/landing/architecture-scene'

const SIGNALS = [
  {
    title: 'Context packet',
    body: 'Plans for what changed.',
    position: 'md:absolute md:left-[-2.5rem] md:top-[3.5rem]',
    accent: 'text-cyan-300 border-cyan-400/20',
  },
  {
    title: 'Memory packet',
    body: 'Keeps runs, facts, and sources.',
    position: 'md:absolute md:right-[-2rem] md:top-[12rem]',
    accent: 'text-emerald-300 border-emerald-400/20',
  },
  {
    title: 'Harness packet',
    body: 'Replays safely and wakes later.',
    position: 'md:absolute md:left-[4rem] md:bottom-[3rem]',
    accent: 'text-amber-300 border-amber-300/20',
  },
]

const LAYERS = [
  {
    name: 'Context Engineering',
    accent: '#00dbe9',
    summary: 'Right searches. Less noise.',
    code: 'planQueries()',
  },
  {
    name: 'Memory Engineering',
    accent: '#65f2b5',
    summary: 'Durable topic state.',
    code: 'loadMemory()',
  },
  {
    name: 'Harness Engineering',
    accent: '#ffb84e',
    summary: 'Runs keep going.',
    code: 'sleep()',
  },
]

const IMPACTS = [
  {
    value: 'Delta-first',
    label: 'The next run shows what changed, not the same summary again.',
  },
  {
    value: 'Second brain',
    label: 'Every useful URL becomes another durable node in the research mesh.',
  },
  {
    value: 'Recurring',
    label: 'Research can sleep, wake, and continue with state intact.',
  },
]

const DEMOS = [
  ['Run 01', 'Baseline scan', 'Sources indexed and memory created.'],
  ['Run 02', 'Delta report', 'Only new launches, pricing, and movement.'],
  ['Surface', 'MCP + CLI + UI', 'Same state reused across every entrypoint.'],
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#e5e2e3] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none landing-noise opacity-40" />
      <div className="absolute inset-x-0 top-0 h-[32rem] pointer-events-none neural-backdrop opacity-80" />

      <header className="relative z-10 border-b border-white/8">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-cyan-400/35 bg-cyan-400/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-cyan-400 text-[20px]">adjust</span>
            </div>
            <div>
              <div className="text-[11px] tracking-[0.3em] uppercase text-cyan-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Beacon
              </div>
              <div className="text-[12px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Durable web research with context, memory, and harness layers
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#c7d4d6] hover:bg-white/5 transition-colors"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Open Dashboard
            </Link>
            <Link
              href="/briefs/new?topic=AI%20agent%20platform%20pricing%20and%20launches%202026"
              className="bg-cyan-400 text-[#002022] px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-cyan-300 transition-colors"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Run Sample Brief
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-start gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <div className="inline-flex w-fit items-center gap-2 border border-cyan-400/20 bg-cyan-400/8 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-cyan-300"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  <span className="w-2 h-2 bg-cyan-400 animate-pulse" />
                  MCP + CLI + durable memory substrate
                </div>

                <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-[#f4f7f8] md:text-7xl">
                  Research that gets smarter every time it runs.
                </h1>
                <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[#9db0b3]"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Beacon turns source links into a second-brain memory mesh, then uses that memory to track what changed on the next run.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 xl:justify-end">
                <Link
                  href="/dashboard"
                  className="bg-cyan-400 text-[#002022] px-6 py-3 text-[12px] uppercase tracking-[0.24em] font-bold hover:bg-cyan-300 transition-colors"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Enter Dashboard
                </Link>
                <Link
                  href="/memory"
                  className="border border-white/10 px-6 py-3 text-[12px] uppercase tracking-[0.24em] text-[#d7e2e4] hover:bg-white/5 transition-colors"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Inspect Memory Bank
                </Link>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {IMPACTS.map((item) => (
                <div key={item.value} className="border border-white/8 bg-black/25 p-5">
                  <div className="text-[18px] leading-6 text-[#f3f7f8] mb-2">
                    {item.value}
                  </div>
                  <p className="text-[12px] leading-6 text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative">
              <ArchitectureScene />
              {SIGNALS.map((signal) => (
                <div
                  key={signal.title}
                  className={`relative mt-3 border bg-black/70 p-4 md:mt-0 md:max-w-[16rem] ${signal.position} ${signal.accent}`}
                >
                  <div className="mb-2 text-[10px] uppercase tracking-[0.24em]"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {signal.title}
                  </div>
                  <p className="text-[12px] leading-6 text-[#c4d1d3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {signal.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {LAYERS.map((layer) => (
                <div key={layer.name} className="border border-white/8 bg-black/25 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: layer.accent, boxShadow: `0 0 12px ${layer.accent}` }} />
                    <span className="text-[11px] uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-space-grotesk)', color: layer.accent }}>
                      {layer.name}
                    </span>
                  </div>
                  <p className="text-[12px] leading-6 text-[#90a3a7]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {layer.summary}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                ['Context', 'Plans the next useful search.'],
                ['Memory', 'Turns URLs into durable nodes.'],
                ['Harness', 'Keeps the mesh alive across runs.'],
              ].map(([title, body]) => (
                <div key={title} className="border border-white/8 bg-white/[0.02] p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300 mb-3"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {title}
                  </div>
                  <p className="text-[13px] leading-6 text-[#8da0a3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-8">
            <div className="border border-white/8 bg-white/[0.02] p-6">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-5" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Demo flow
              </div>
              <div className="grid gap-3">
                {DEMOS.map(([kicker, title, body]) => (
                  <div key={title} className="border border-white/8 bg-black/20 p-4">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-2"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {kicker}
                    </div>
                    <div className="text-[18px] leading-6 text-[#eef3f4] mb-2">{title}</div>
                    <p className="text-[12px] leading-6 text-[#a5b6b9]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/8 bg-white/[0.02] p-6">
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  ['MCP', 'Other agents can call Beacon.'],
                  ['CLI', 'Operators can inspect state fast.'],
                  ['Dashboard', 'The UI stays the control room.'],
                ].map(([title, body]) => (
                  <div key={title} className="border border-white/8 bg-black/20 p-4">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[#dce7e8] mb-2"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {title}
                    </div>
                    <p className="text-[12px] leading-6 text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {body}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 border border-cyan-400/18 bg-cyan-400/[0.04] p-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-2"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Main result
                </div>
                <div className="text-2xl md:text-3xl tracking-[-0.03em] text-[#f3f7f8]">
                  Beacon turns repeated research into reusable state.
                </div>
                <p className="mt-3 text-[13px] leading-7 text-[#98abaf]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Every run adds more linked evidence, which makes later deltas faster and more useful for both people and agents.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="border border-cyan-400/18 bg-cyan-400/[0.04] p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                One line
              </div>
              <h2 className="text-3xl md:text-4xl tracking-[-0.03em] text-[#f3f7f8]">
                Most agents answer once. Beacon keeps the research alive.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="bg-cyan-400 text-[#002022] px-6 py-3 text-[12px] uppercase tracking-[0.24em] font-bold hover:bg-cyan-300 transition-colors"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Go to Dashboard
              </Link>
              <Link
                href="/briefs/new?topic=AI%20agent%20platform%20pricing%20and%20launches%202026"
                className="border border-white/10 px-6 py-3 text-[12px] uppercase tracking-[0.24em] text-[#d7e2e4] hover:bg-white/5 transition-colors"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Launch Example Brief
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
