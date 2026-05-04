import Link from 'next/link'
import { Search, Database, Layers, CheckCircle2, Bot, Zap, ArrowRight, Download, LayoutDashboard, Share2, Code } from 'lucide-react'
import ArchitectureScene from '@/components/landing/architecture-scene'
import PublicDocsSearch from '@/components/landing/public-docs-search'
import { FRAMEWORKS } from '@/lib/frameworks'

const NAV_ITEMS = [
  { href: '/trial', label: 'Demo' },
  { href: '/docs', label: 'Docs' },
  { href: '/support', label: 'Support' },
  { href: '/dashboard', label: 'Dashboard' },
]

const USE_CASES = [
  {
    icon: 'rocket_launch',
    label: 'Hackathon validation',
    title: 'Validate a problem before you build.',
    body: 'Check whether the pain is real, who already complains about it, what alternatives exist today, and whether the timing is right — before you spend the weekend building.',
    cta: 'Try validation brief',
    href: '/trial',
  },
  {
    icon: 'schema',
    label: 'Framework-led deep research',
    title: 'Same topic, different method, different answer.',
    body: 'Applying Jobs To Be Done produces different search plans and reports than RICE or Porter\'s Five Forces. The framework changes what counts as evidence.',
    cta: 'Browse frameworks',
    href: '/docs',
  },
  {
    icon: 'autorenew',
    label: 'Delta tracking',
    title: 'Run once for the baseline. Rerun for what changed.',
    body: 'Beacon keeps the prior evidence base, skips URLs it already knows, and leads the next report with new movement instead of repeating old summaries.',
    cta: 'See rerun flow',
    href: '/memory',
  },
]

const WORKFLOW_STEPS = [
  {
    num: '01',
    icon: <Search className="h-4 w-4 text-cyan-300" />,
    title: 'Define the question',
    body: 'Set the topic, objective, and depth. Beacon starts by loading prior memory for the same topic before planning new searches.',
    accent: false,
  },
  {
    num: '02',
    icon: <Layers className="h-4 w-4 text-cyan-300" />,
    title: 'Choose the research method',
    body: 'Frameworks like JTBD, RICE, SWOT, or Porter change both the search plan and the final synthesis, so Beacon investigates with a clear lens instead of generic summarization.',
    accent: true,
  },
  {
    num: '03',
    icon: <Database className="h-4 w-4 text-cyan-300" />,
    title: 'Search, validate, and save',
    body: 'Parallel search agents collect evidence, a validator checks contradictions, and the final cited report is written back into durable memory for the next run.',
    accent: false,
  },
]

const HACKATHON_FRAMEWORKS = [
  'Jobs To Be Done',
  'Problem / Solution Fit',
  'Opportunity Solution Tree',
  'SWOT Analysis',
  'PESTLE',
  'RICE Scoring',
  'Market Map',
  'Blue Ocean',
]

const SURFACES = [
  ['Demo', '/trial', 'Run the public sample flow and test frameworks before account setup.'],
  ['Dashboard', '/dashboard', 'Operate briefs, memory, API keys, and logs from the main product surface.'],
  ['Memory Graph', '/graph', 'Inspect provenance and see how sources, reports, and reruns connect.'],
  ['API + MCP', '/docs/api', 'Trigger Beacon from scripts, workflows, Claude Desktop, or Cursor.'],
]

const DOC_LINKS = [
  ['Quickstart', '/docs/quickstart'],
  ['API Reference', '/docs/api'],
  ['MCP Guide', '/docs/mcp'],
  ['Authentication', '/docs/authentication'],
  ['Rate Limits', '/docs/rate-limits'],
  ['Security', '/docs/security'],
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#e5e2e3] overflow-clip">
      <div className="absolute inset-0 pointer-events-none landing-noise opacity-40" />
      <div className="absolute inset-x-0 top-0 h-[32rem] pointer-events-none neural-backdrop opacity-80" />

      {/* ── Nav ── */}
      <header className="sticky top-4 z-50 mx-4 max-w-7xl rounded-2xl border border-white/8 bg-[#0b0d10]/80 backdrop-blur-xl lg:mx-auto">
        <div className="flex items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-cyan-400/35 bg-cyan-400/10">
              <span className="material-symbols-outlined text-[20px] text-cyan-400">adjust</span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Beacon
              </div>
              <div className="text-[12px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Validate. Track. Remember.
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] uppercase tracking-[0.18em] text-[#c7d4d6] transition-colors hover:text-cyan-300"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <PublicDocsSearch />
            <Link
              href="/docs"
              className="hidden border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#c7d4d6] transition-colors hover:bg-white/5 sm:inline-flex"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Open Docs
            </Link>
            <Link
              href="/trial"
              className="bg-cyan-400 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#002022] transition-colors hover:bg-cyan-300"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Run Sample Brief
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">

        {/* ── Hero ── */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.1fr)_380px] xl:items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/8 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-cyan-300"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <span className="h-2 w-2 bg-cyan-400 animate-pulse" />
                Durable research agent — Vercel Zero to Agent 2026
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-[#f4f7f8] md:text-7xl">
                Validate a problem, track what changes, and keep the evidence.
              </h1>

              <p
                className="mt-6 max-w-3xl text-[17px] leading-8 text-[#9db0b3]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Beacon is a durable web research agent for questions that need more than one pass. It fans out deep parallel searches, applies structured research frameworks, saves everything it learned, and turns reruns into delta reports instead of starting from zero.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/trial"
                  className="bg-cyan-400 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.24em] text-[#002022] transition-colors hover:bg-cyan-300"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Run Sample Brief
                </Link>
                <Link
                  href="/trial"
                  className="border border-white/10 px-6 py-3 text-[12px] uppercase tracking-[0.24em] text-[#d7e2e4] transition-colors hover:bg-white/5"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Try Hackathon Validation
                </Link>
                <Link
                  href="/docs"
                  className="border border-cyan-400/18 bg-cyan-400/[0.04] px-6 py-3 text-[12px] uppercase tracking-[0.24em] text-cyan-200 transition-colors hover:bg-cyan-400/[0.08]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Read Docs
                </Link>
              </div>
            </div>

            {/* Hero proof points */}
            <div className="grid gap-3">
              {[
                ['Built for repeated research', 'Use Beacon when a topic needs a baseline now and a smarter rerun later.', <Database key="1" size={16} className="text-cyan-400" />],
                ['Frameworks change the investigation', `${FRAMEWORKS.length} research lenses reshape both search planning and final synthesis.`, <Layers key="2" size={16} className="text-cyan-400" />],
              ].map(([title, body, icon]) => (
                <div key={title as string} className="border border-white/8 bg-black/25 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {icon}
                    <div className="text-[15px] text-[#f3f7f8]">{title}</div>
                  </div>
                  <p className="text-[12px] leading-6 text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Use Cases ── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="mb-8">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Built for
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#f3f7f8]">
              Research that needs a second run.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {USE_CASES.map((uc) => (
              <div key={uc.label} className="border border-white/8 bg-black/25 p-5 flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[18px] text-cyan-400">{uc.icon}</span>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {uc.label}
                    </div>
                  </div>
                  <div className="text-[16px] text-[#eef3f4] leading-snug mb-2">{uc.title}</div>
                  <p className="text-[12px] leading-6 text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {uc.body}
                  </p>
                </div>
                <Link
                  href={uc.href}
                  className="mt-auto self-start border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-cyan-200 transition-colors hover:bg-cyan-400/10"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {uc.cta} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works: Pipeline ── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="mb-8">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Workflow
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#f3f7f8]">
              From question to reusable evidence base.
            </h2>
          </div>

          {/* Pipeline flow */}
          <div className="relative">
            {/* Connector line — hidden on mobile */}
            <div className="absolute top-[44px] left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent lg:block" />

            <div className="grid gap-4 lg:grid-cols-3">
              {WORKFLOW_STEPS.map((step, i) => (
                <div
                  key={step.num}
                  className={`relative border p-5 flex flex-col gap-3 ${
                    step.accent
                      ? 'border-cyan-400/40 bg-cyan-400/[0.05]'
                      : 'border-white/8 bg-black/25'
                  }`}
                >
                  {/* Step number and icon */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center text-[11px] font-bold border ${
                        step.accent
                          ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-300'
                          : 'border-white/12 bg-black/30 text-[#849495]'
                      }`}
                      style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                    >
                      {step.num}
                    </div>
                    {step.icon}
                    {/* Arrow connector between steps */}
                    {i < WORKFLOW_STEPS.length - 1 && (
                      <span className="absolute right-[-10px] top-[26px] z-10 hidden text-[#849495] text-[14px] lg:block">›</span>
                    )}
                  </div>
                  <div className={`text-[14px] font-medium leading-snug ${step.accent ? 'text-cyan-200' : 'text-[#eef3f4]'}`}>
                    {step.title}
                  </div>
                  <p className="text-[11px] leading-[1.6] text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {step.body}
                  </p>
                  {step.accent && (
                    <div className="mt-auto flex items-center gap-1.5 text-[10px] text-cyan-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      <span className="h-1.5 w-1.5 bg-cyan-400 animate-pulse" />
                      Framework controls the research lens
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border border-cyan-400/15 bg-cyan-400/[0.03] p-5 text-[13px] leading-7 text-[#9db0b3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Deep mode fans out parallel searches across landscape, competitive, and community signals, then uses a validator pass to merge contradictions into one cited report.
          </div>
        </section>

        {/* ── Neural Memory Mesh ── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="mb-8">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Memory architecture
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#f3f7f8] max-w-2xl">
              Why Beacon never restarts from zero.
            </h2>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-[#9db0b3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Every URL, fact, and summary becomes a node in a persistent graph. Each rerun strengthens the existing mesh — so run three is faster, deeper, and more targeted than run one. The topology below is live: signal packets show data flowing between layers in real time.
            </p>
          </div>

          <ArchitectureScene />

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              {
                dot: '#00dbe9',
                label: 'Context layer',
                title: 'What the model sees per request',
                body: 'Query plans, compressed SERP results, and memory context are assembled fresh each run — optimized so the model always works from the most relevant slice of knowledge, not a raw data dump.',
              },
              {
                dot: '#65f2b5',
                label: 'Memory layer',
                title: 'What compounds across runs',
                body: 'Seen URLs, extracted facts, run summaries, and source attribution are stored per topic in Redis with 30-day TTL. Later runs skip known URLs and lead with what changed — no repeated baselines.',
              },
              {
                dot: '#ffb84e',
                label: 'Harness layer',
                title: 'What keeps the system reliable',
                body: 'Workflow SDK step idempotency, structured logging, and Vercel durable execution mean partial failures retry cleanly, long runs survive restarts, and every step is observable and auditable.',
              },
            ].map((card) => (
              <div key={card.label} className="border border-white/8 bg-black/25 p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0 animate-pulse" style={{ background: card.dot }} />
                  <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: card.dot, fontFamily: 'var(--font-space-grotesk)' }}>
                    {card.label}
                  </div>
                </div>
                <div className="text-[15px] text-[#eef3f4] leading-snug">{card.title}</div>
                <p className="text-[12px] leading-[1.65] text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Agents & Skills ── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="mb-8">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Extensibility
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#f3f7f8]">
              Agents and Skills.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-white/8 bg-black/25 p-6 transition-colors hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="text-cyan-400" size={24} />
                <div className="text-[16px] text-[#eef3f4]">Multi-Agent Architecture</div>
              </div>
              <p className="text-[13px] leading-7 text-[#8ea1a5] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Beacon relies on a distributed multi-agent system to handle parallel research tasks. Specialized agents for searching, validating, and synthesizing operate concurrently, guided by the central orchestration engine.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/docs/architecture" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-cyan-300 hover:text-cyan-200" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Open architecture docs <ArrowRight size={12} />
                </Link>
                <Link href="/api/public-download/agents" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[#9ed8ff] hover:text-cyan-200" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Download AGENTS.md <Download size={12} />
                </Link>
              </div>
            </div>
            <div className="border border-white/8 bg-black/25 p-6 transition-colors hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-cyan-400" size={24} />
                <div className="text-[16px] text-[#eef3f4]">Pluggable Skills</div>
              </div>
              <p className="text-[13px] leading-7 text-[#8ea1a5] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Skills extend Beacon&apos;s core capabilities, allowing it to adapt to specific frameworks, external tools, or custom validation rules. Skills are implemented as declarative Markdown modules.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/docs/frameworks" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-cyan-300 hover:text-cyan-200" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Open framework docs <ArrowRight size={12} />
                </Link>
                <Link href="/api/public-download/skill" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[#9ed8ff] hover:text-cyan-200" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Download SKILL.md <Download size={12} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Hackathon Validation ── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="border border-cyan-400/15 bg-cyan-400/[0.03] p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="lg:max-w-sm">
                <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  For hackathon builders
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#f3f7f8] mb-3">
                  Validate the problem before you build.
                </h2>
                <p className="text-[13px] leading-7 text-[#9db0b3] mb-5" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Use Beacon to pressure-test whether your hackathon idea solves a real problem before you spend the weekend building it. Check whether the pain is real, who already complains about it, what alternatives exist, and whether recent market movement suggests urgency.
                </p>
                <Link
                  href="/trial"
                  className="inline-flex bg-cyan-400 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#002022] transition-colors hover:bg-cyan-300"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Run Validation Brief →
                </Link>
              </div>

              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#849495] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Recommended validation frameworks
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {HACKATHON_FRAMEWORKS.map((fw) => (
                    <span
                      key={fw}
                      className="border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] text-[#c4d4d7]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      {fw}
                    </span>
                  ))}
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    'Is this problem real and documented in the wild?',
                    'Who feels the pain most — and are they already vocal about it?',
                    'What solutions already exist, and what do they miss?',
                    'Is the timing right based on recent market movement?',
                  ].map((q) => (
                    <div key={q} className="flex items-start gap-2 text-[12px] text-[#9db0b3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      <CheckCircle2 className="text-cyan-400 mt-0.5 shrink-0" size={14} />
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Access Surfaces ── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="mb-8">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Access surfaces
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#f3f7f8]">
              Use Beacon from anywhere.
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {SURFACES.map(([title, href, body, icon]) => (
              <Link
                key={title as string}
                href={href as string}
                className="border border-white/8 bg-black/25 p-5 transition-colors hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
              >
                {icon}
                <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Surface
                </div>
                <div className="text-[17px] text-[#eef3f4] mb-2">{title as string}</div>
                <p className="text-[12px] leading-6 text-[#92a5a8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {body as string}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── API + Docs ── */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border border-white/8 bg-black/25 p-6">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                HTTP API
              </div>
              <p className="max-w-xl text-[13px] leading-7 text-[#98abaf] mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Trigger research runs, poll status, and read reports from any script, workflow, or agent. Same depth, framework, and memory engine as the dashboard.
              </p>
              <pre className="overflow-x-auto border border-white/8 bg-black/30 p-4 text-[12px] leading-6 text-[#d3dddf]">
                <code style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>{`curl -X POST /api/briefs \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "AI coding agents 2026",
    "objective": "Compare platforms and pricing",
    "depth": "deep",
    "timeframe": "30d",
    "reportStyle": "executive"
  }'`}</code>
              </pre>
              <div className="mt-4">
                <Link
                  href="/docs/api"
                  className="inline-flex border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-300 transition-colors hover:bg-cyan-400/12"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Open API Reference →
                </Link>
              </div>
            </div>

            <div className="border border-white/8 bg-black/25 p-6">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Developer docs
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {DOC_LINKS.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="border border-white/8 bg-black/20 p-4 transition-colors hover:border-cyan-400/20"
                  >
                    <div className="text-[14px] text-[#eef3f4]">{label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/8">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-cyan-400/35 bg-cyan-400/10">
                <span className="material-symbols-outlined text-[20px] text-cyan-400">adjust</span>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Beacon
                </div>
                <div className="text-[12px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Validate. Track. Remember.
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-7 text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Durable web research agent with persistent memory, delta reporting, multi-agent deep search, and {FRAMEWORKS.length} research frameworks.
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Product
            </div>
            <div className="mt-4 flex flex-col gap-2 text-[13px] text-[#c8d5d8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <Link href="/trial" className="hover:text-cyan-300">Sample Brief</Link>
              <Link href="/dashboard" className="hover:text-cyan-300">Dashboard</Link>
              <Link href="/graph" className="hover:text-cyan-300">Research Graph</Link>
              <Link href="/memory" className="hover:text-cyan-300">Memory Bank</Link>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Resources
            </div>
            <div className="mt-4 flex flex-col gap-2 text-[13px] text-[#c8d5d8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <Link href="/docs" className="hover:text-cyan-300">Documentation</Link>
              <Link href="/docs/api" className="hover:text-cyan-300">API Reference</Link>
              <Link href="/docs/mcp" className="hover:text-cyan-300">MCP Guide</Link>
              <Link href="/docs/security" className="hover:text-cyan-300">Security</Link>
              <Link href="/support" className="hover:text-cyan-300">Support</Link>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Author
            </div>
            <div className="mt-4 flex flex-col gap-2 text-[13px] text-[#c8d5d8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <a href="https://github.com/KpG782" target="_blank" rel="noreferrer" className="hover:text-cyan-300">
                Ken Garcia on GitHub
              </a>
              <a href="https://www.kenbuilds.tech" target="_blank" rel="noreferrer" className="hover:text-cyan-300">
                kenbuilds.tech
              </a>
              <a href="https://www.linkedin.com/in/ken-patrick-garcia-ba5430285" target="_blank" rel="noreferrer" className="hover:text-cyan-300">
                LinkedIn
              </a>
              <span className="text-[#8ea1a5]">AI Full-Stack Engineer · Manila, Philippines · Creator of Beacon.</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 text-[12px] text-[#849495] md:flex-row md:items-center md:justify-between">
            <div style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              © 2026 Beacon. Created by Ken Patrick Garcia for the Vercel Zero to Agent Hackathon.
            </div>
            <div className="flex items-center gap-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <Link href="/privacy" className="hover:text-cyan-300">Privacy</Link>
              <Link href="/terms" className="hover:text-cyan-300">Terms</Link>
              <Link href="/disclaimer" className="hover:text-cyan-300">Disclaimer</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
