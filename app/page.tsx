import Link from 'next/link'
import ArchitectureScene from '@/components/landing/architecture-scene'
import { FRAMEWORKS } from '@/lib/frameworks'

const NAV_ITEMS = [
  { href: '/trial', label: 'Demo' },
  { href: '/docs', label: 'Docs' },
  { href: '/support', label: 'Support' },
  { href: '/dashboard', label: 'Dashboard' },
]

const HERO_METRICS = [
  ['Persistent memory', 'Each rerun starts with prior facts and known URLs.'],
  ['Framework-guided', `${FRAMEWORKS.length} research lenses shape search and synthesis.`],
  ['Multi-surface', 'Trial, dashboard, graph, MCP, and API all point at the same core workflow.'],
]

const HOW_IT_WORKS = [
  ['1', 'Start with a topic', 'Use the sample brief flow or go straight into the dashboard research setup.'],
  ['2', 'Beacon plans the search', 'Context prompts and frameworks expand the topic into targeted queries.'],
  ['3', 'The workflow builds state', 'Sources, facts, summaries, and deltas are saved so later runs get smarter.'],
  ['4', 'Use the result anywhere', 'Read the report in the app, inspect the graph, or trigger research from MCP.'],
]

const SURFACES = [
  ['Sample Brief', '/trial', 'Public try-before-signup entrypoint with a guided setup flow and live graph loading.'],
  ['Dashboard', '/dashboard', 'Private operator surface for running briefs, inspecting memory, and managing keys.'],
  ['Docs', '/docs', 'Public documentation hub for HTTP, MCP, auth, security, deployment, and roadmap status.'],
  ['Support', '/support', 'Troubleshooting surface for runtime, memory, workflow, and integration recovery steps.'],
  ['Memory Graph', '/graph', 'Visualize how one report becomes reusable graph-shaped research state.'],
  ['Memory Bank', '/memory', 'Inspect durable topic memory, facts, run history, and saved source ledgers.'],
]

const DOC_LINKS = [
  ['Quickstart', '/docs/quickstart'],
  ['API Reference', '/docs/api'],
  ['MCP Guide', '/docs/mcp'],
  ['Authentication', '/docs/authentication'],
  ['Rate Limits', '/docs/rate-limits'],
  ['Security', '/docs/security'],
]

const DOC_MAP = [
  [
    'Docs',
    '/docs',
    'Should answer what Beacon is, how to start, what APIs and MCP tools exist, how setup works, and what is planned versus shipped.',
  ],
  [
    'Support',
    '/support',
    'Should stay focused on troubleshooting, runtime errors, missing memory, workflow issues, and recovery checklists.',
  ],
  [
    'Author',
    'https://github.com/KpG782',
    'Should clearly identify who built Beacon, the project context, and where people can check the repo or reach the maintainer.',
  ],
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#e5e2e3] overflow-clip">
      <div className="absolute inset-0 pointer-events-none landing-noise opacity-40" />
      <div className="absolute inset-x-0 top-0 h-[32rem] pointer-events-none neural-backdrop opacity-80" />

      <header className="sticky top-4 z-50 mx-4 max-w-7xl rounded-2xl border border-white/8 bg-[#0b0d10]/80 backdrop-blur-xl lg:mx-auto">
        <div className="flex items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-cyan-400/35 bg-cyan-400/10">
              <span className="material-symbols-outlined text-[20px] text-cyan-400">adjust</span>
            </div>
            <div>
              <div
                className="text-[11px] uppercase tracking-[0.3em] text-cyan-400"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Beacon
              </div>
              <div
                className="text-[12px] text-[#849495]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Durable web research with context, memory, and harness layers
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
        <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.05fr)_420px] xl:items-end">
            <div>
              <div
                className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/8 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-cyan-300"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <span className="h-2 w-2 bg-cyan-400 animate-pulse" />
                Trial + dashboard + MCP
              </div>

              <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-[#f4f7f8] md:text-7xl">
                Research that keeps getting better after the first run.
              </h1>

              <p
                className="mt-6 max-w-3xl text-[17px] leading-8 text-[#9db0b3]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Beacon is a durable web research agent with persistent memory. It plans targeted searches, saves what
                each topic already knows, and turns later reruns into deltas instead of repeating the same report.
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
                  href="/dashboard"
                  className="border border-white/10 px-6 py-3 text-[12px] uppercase tracking-[0.24em] text-[#d7e2e4] transition-colors hover:bg-white/5"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Open Dashboard
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

            <div className="grid gap-3">
              {HERO_METRICS.map(([title, body]) => (
                <div key={title} className="border border-white/8 bg-black/25 p-5">
                  <div className="text-[17px] text-[#f3f7f8]">{title}</div>
                  <p
                    className="mt-2 text-[12px] leading-6 text-[#8ea1a5]"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-18">
          <div className="relative">
            <ArchitectureScene />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-18">
          <div className="grid gap-3 md:grid-cols-4">
            {HOW_IT_WORKS.map(([step, title, body]) => (
              <div key={step} className="border border-white/8 bg-black/25 p-5">
                <div
                  className="text-[10px] uppercase tracking-[0.22em] text-cyan-300"
                  style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                >
                  {step}
                </div>
                <div className="mt-3 text-[18px] text-[#f3f7f8]">{title}</div>
                <p
                  className="mt-2 text-[12px] leading-6 text-[#8ea1a5]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-18">
          <div className="border border-cyan-400/18 bg-cyan-400/[0.04] p-6 md:p-7">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div
                  className="inline-flex items-center gap-2 border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-cyan-300"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  <span className="h-1.5 w-1.5 bg-cyan-300 animate-pulse" />
                  Core capability
                </div>
                <h2 className="mt-3 text-2xl tracking-[-0.03em] text-[#f3f7f8]">
                  {FRAMEWORKS.length} research frameworks shape the system behavior.
                </h2>
                <p
                  className="mt-2 max-w-3xl text-[13px] leading-7 text-[#98abaf]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Framework choice is not cosmetic. It changes the planning prompt and the synthesis prompt so the
                  same topic can be explored through different research methods.
                </p>
              </div>
              <Link
                href="/trial"
                className="border border-cyan-400/35 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-cyan-200 transition-colors hover:bg-cyan-400/10"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Try Frameworks
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-18">
          <div className="grid gap-3 lg:grid-cols-3">
            {SURFACES.map(([title, href, body]) => (
              <Link
                key={title}
                href={href}
                className="border border-white/8 bg-black/25 p-5 transition-colors hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
              >
                <div
                  className="text-[10px] uppercase tracking-[0.22em] text-cyan-300"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Access Surface
                </div>
                <div className="mt-3 text-[18px] text-[#eef3f4]">{title}</div>
                <p
                  className="mt-2 text-[12px] leading-6 text-[#92a5a8]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {body}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-18">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border border-white/8 bg-black/25 p-6">
              <div
                className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Try Beacon via API
              </div>
              <p
                className="max-w-xl text-[13px] leading-7 text-[#98abaf]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Beacon is not only a UI. The private HTTP surface lets authenticated users create research runs from
                their own tooling with the same workflow and framework engine used in the app.
              </p>
              <pre className="mt-4 overflow-x-auto border border-white/8 bg-black/30 p-4 text-[12px] leading-6 text-[#d3dddf]">
                <code style={{ fontFamily: 'var(--font-space-grotesk)' }}>{`curl -X POST http://localhost:3000/api/briefs \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "AI coding agent benchmarks in 2026",
    "objective": "Compare platforms and trust signals",
    "focus": "pricing, API, enterprise readiness",
    "depth": "deep",
    "timeframe": "30d",
    "reportStyle": "memo"
  }'`}</code>
              </pre>
              <div className="mt-4">
                <Link
                  href="/docs/api"
                  className="inline-flex border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-300 transition-colors hover:bg-cyan-400/12"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Open API Reference
                </Link>
              </div>
            </div>

            <div className="border border-white/8 bg-black/25 p-6">
              <div
                className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Developer Portal
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {DOC_LINKS.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="border border-white/8 bg-black/20 p-4 transition-colors hover:border-cyan-400/20"
                  >
                    <div className="text-[15px] text-[#eef3f4]">{label}</div>
                    <p
                      className="mt-2 text-[12px] leading-6 text-[#92a5a8]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      Public documentation page inside Beacon.
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border border-white/8 bg-black/25 p-6">
              <div
                className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Navbar and hero focus
              </div>
              <div className="grid gap-3">
                {[
                  ['Navbar', 'Should only point to Demo, Docs, Support, and Dashboard.'],
                  ['Hero', 'Should explain Beacon in one pass: what it is, why it is different, and where to try it.'],
                  ['Primary CTA', 'Run Sample Brief should stay the clearest next action for first-time visitors.'],
                ].map(([title, body]) => (
                  <div key={title} className="border border-white/8 bg-black/20 p-4">
                    <div className="text-[16px] text-[#eef3f4]">{title}</div>
                    <p
                      className="mt-2 text-[12px] leading-6 text-[#92a5a8]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/8 bg-black/25 p-6">
              <div
                className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Footer information architecture
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {DOC_MAP.map(([title, href, body]) => (
                  <Link
                    key={title}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noreferrer' : undefined}
                    className="border border-white/8 bg-[#091117] p-4 transition-colors hover:border-cyan-400/20"
                  >
                    <div
                      className="text-[10px] uppercase tracking-[0.2em] text-cyan-300"
                      style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                    >
                      {title}
                    </div>
                    <p
                      className="mt-3 text-[12px] leading-6 text-[#c4d4d7]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      {body}
                    </p>
                  </Link>
                ))}
              </div>
              <p
                className="mt-5 text-[13px] leading-7 text-[#98abaf]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Footer links should help users answer three questions fast: how to use Beacon, how to troubleshoot it,
                and who built it. Anything beyond that should come after those basics are clear.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/8">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-cyan-400/35 bg-cyan-400/10">
                <span className="material-symbols-outlined text-[20px] text-cyan-400">adjust</span>
              </div>
              <div>
                <div
                  className="text-[11px] uppercase tracking-[0.3em] text-cyan-400"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Beacon
                </div>
                <div
                  className="text-[12px] text-[#849495]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Durable research with context, memory, and harness.
                </div>
              </div>
            </div>
            <p
              className="mt-4 max-w-sm text-[13px] leading-7 text-[#8ea1a5]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Durable web research agent with persistent cross-session memory, delta reporting, workflow orchestration,
              and multi-surface access.
            </p>
          </div>

          <div>
            <div
              className="text-[10px] uppercase tracking-[0.22em] text-cyan-300"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
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
            <div
              className="text-[10px] uppercase tracking-[0.22em] text-cyan-300"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Resources
            </div>
            <div className="mt-4 flex flex-col gap-2 text-[13px] text-[#c8d5d8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <Link href="/docs" className="hover:text-cyan-300">Documentation</Link>
              <Link href="/docs/api" className="hover:text-cyan-300">API Reference</Link>
              <Link href="/docs/security" className="hover:text-cyan-300">Security</Link>
              <Link href="/support" className="hover:text-cyan-300">Support</Link>
              <Link href="/docs/quickstart" className="hover:text-cyan-300">Quickstart</Link>
            </div>
          </div>

          <div>
            <div
              className="text-[10px] uppercase tracking-[0.22em] text-cyan-300"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Author
            </div>
            <div className="mt-4 flex flex-col gap-2 text-[13px] text-[#c8d5d8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <a href="https://github.com/KpG782" target="_blank" rel="noreferrer" className="hover:text-cyan-300">
                KpG782 on GitHub
              </a>
              <span className="text-[#8ea1a5]">Vercel Zero to Agent Hackathon 2026 build.</span>
              <Link href="/docs" className="hover:text-cyan-300">Developer-facing docs</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 text-[12px] text-[#849495] md:flex-row md:items-center md:justify-between">
            <div style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              © 2026 Beacon. Built for durable research, persistent memory, and agent-native workflows.
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
