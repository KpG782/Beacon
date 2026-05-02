import Link from 'next/link'
import ArchitectureScene from '@/components/landing/architecture-scene'

const LAYERS = [
  {
    name: 'Context Engineering',
    accent: '#00dbe9',
    summary: 'Controls what the model sees right now so every run is focused, compressed, and grounded in the right evidence.',
    details: [
      'Beacon turns one topic into targeted query plans instead of vague prompting.',
      'Search results are compressed before synthesis so the writer model sees signal, not SERP noise.',
      'Previous knowledge is injected into planning, so reruns search for what is new, not what is already known.',
    ],
    code: 'planQueries() · compressSerpResults() · buildMemoryContext()',
  },
  {
    name: 'Memory Engineering',
    accent: '#65f2b5',
    summary: 'Persists structured knowledge about a topic so repeat briefs get sharper and more differentiated over time.',
    details: [
      'Beacon stores seen URLs, key facts, and the last report summary in Redis.',
      'Already-seen links are filtered out before synthesis, producing delta reports instead of recycled summaries.',
      'The run ledger and source history are durable too, so operators can reopen prior work after reloads.',
    ],
    code: 'loadMemory() · filterSeenUrls() · saveMemory()',
  },
  {
    name: 'Harness Engineering',
    accent: '#ffb84e',
    summary: 'Makes the system durable and inspectable, so the agent survives retries, restarts, and recurring execution windows.',
    details: [
      'Workflow SDK steps are idempotent and checkpointed, so a browser close does not kill the run.',
      'Recurring briefs can sleep without polling or burning compute, then wake up later with context intact.',
      'Status reconciliation, logs, and persisted brief records make the operator surface auditable instead of fragile.',
    ],
    code: "Workflow steps · sleep() · syncBriefRecord()",
  },
]

const STORY = [
  {
    step: '01',
    title: 'A team asks one recurring market question.',
    body: 'Example: “Track AI agent platform pricing, launches, and adoption shifts every week.”',
  },
  {
    step: '02',
    title: 'Beacon fans out, writes, then stores the run.',
    body: 'The first run establishes the baseline across the web, report output, and the source ledger.',
  },
  {
    step: '03',
    title: 'The next run returns only the delta.',
    body: 'Beacon does not just automate search. It compounds prior research and tells you what materially changed.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#e5e2e3] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none landing-noise opacity-40" />

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
        <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24 grid lg:grid-cols-[1.02fr_0.98fr] gap-10 items-start">
          <div className="flex flex-col gap-8">
            <div className="inline-flex w-fit items-center gap-2 border border-cyan-400/20 bg-cyan-400/8 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-cyan-300"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="w-2 h-2 bg-cyan-400 animate-pulse" />
              Not just automation, but research compounding
            </div>

            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-semibold leading-[0.92] tracking-[-0.04em] text-[#f4f7f8]">
                Beacon explains the web as a system that remembers.
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[#9db0b3]"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Most agents can answer one question. Beacon is built to answer the same question over time, with tighter context, durable memory, and a harness that keeps the workflow alive long enough to matter.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                ['Context layer', 'Plans the right searches and compresses noisy evidence.'],
                ['Memory layer', 'Stores URLs, facts, summaries, and prior runs for future delta work.'],
                ['Harness layer', 'Keeps execution durable, idempotent, and inspectable in production.'],
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

            <div className="flex flex-wrap gap-4">
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

          <div className="flex flex-col gap-5">
            <ArchitectureScene />
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
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid lg:grid-cols-[0.88fr_1.12fr] gap-8">
            <div className="border border-white/8 bg-white/[0.02] p-6">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-5" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Story setup
              </div>
              <div className="space-y-4">
                {STORY.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="shrink-0 border border-cyan-400/20 bg-cyan-400/8 w-10 h-10 flex items-center justify-center text-[11px] text-cyan-300"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {item.step}
                    </div>
                    <div>
                      <div className="text-[16px] leading-6 text-[#eef3f4] mb-1">{item.title}</div>
                      <p className="text-[13px] leading-7 text-[#a5b6b9]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/8 bg-white/[0.02] p-6">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-5" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Why this architecture matters
              </div>
              <div className="space-y-5">
                {LAYERS.map((layer) => (
                  <div key={layer.name} className="border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="text-[18px] leading-6 text-[#edf2f3]">{layer.name}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-space-grotesk)', color: layer.accent }}>
                        {layer.code}
                      </div>
                    </div>
                    <p className="text-[13px] leading-7 text-[#93a6aa] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {layer.summary}
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      {layer.details.map((detail) => (
                        <div key={detail} className="border border-white/6 bg-white/[0.02] p-3 text-[12px] leading-6 text-[#a9b9bc]"
                             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="border border-cyan-400/18 bg-cyan-400/[0.04] p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Product hook
              </div>
              <h2 className="text-3xl md:text-4xl tracking-[-0.03em] text-[#f3f7f8]">
                Beacon is important because repeated research is where most teams lose time.
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-[#98abaf]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                This app matters when the same question keeps coming back: market tracking, competitor launches, pricing shifts, ecosystem scans, or weekly updates for ops. Beacon is built so each answer gets smarter instead of starting over.
              </p>
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
