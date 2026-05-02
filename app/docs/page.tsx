import Link from 'next/link'

const SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    title: 'Beacon usage guide',
    body: 'Everything needed to use Beacon from the app, over MCP, or from your own integration code. This page is the local source of truth inside the product.',
  },
  {
    id: 'mcp',
    label: 'MCP',
    title: 'Use Beacon as an MCP server',
    body: 'Beacon already exposes one MCP tool today: `research_brief`. Use MCP when another agent needs to trigger a durable research run and get a run ID back.',
  },
  {
    id: 'sdk',
    label: 'SDK',
    title: 'Use Beacon from code',
    body: 'Beacon can also be used through its HTTP and workflow surfaces. This is the best current option for app-to-app setup if you are not using MCP.',
  },
  {
    id: 'cli',
    label: 'CLI',
    title: 'CLI status',
    body: 'A dedicated `beacon` CLI is part of the v2 plan, but it is not implemented in this repo today. This section shows the intended commands and the current fallback.',
  },
  {
    id: 'setup',
    label: 'Setup',
    title: 'Environment and local setup',
    body: 'Minimum setup for local development, workflow execution, memory, and delivery adapters.',
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    title: 'Troubleshooting',
    body: 'Quick checks for the most common setup and runtime issues.',
  },
]

function SectionBlock({
  id,
  kicker,
  title,
  children,
}: {
  id: string
  kicker: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="border border-white/8 bg-white/[0.02] p-6 scroll-mt-24">
      <div
        className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-3"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {kicker}
      </div>
      <h2 className="text-2xl tracking-[-0.03em] text-[#eef3f4] mb-4">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto border border-white/8 bg-black/30 p-4 text-[12px] leading-6 text-[#d3dddf]">
      <code style={{ fontFamily: 'var(--font-space-grotesk)' }}>{children}</code>
    </pre>
  )
}

export default function DocsPage() {
  return (
    <div className="px-8 py-8">
      <div className="flex flex-col gap-8">
        <div className="border border-cyan-400/15 bg-cyan-400/[0.04] p-8">
          <div
            className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-3"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Local Docs
          </div>
          <h1 className="text-4xl md:text-5xl tracking-[-0.04em] text-[#f3f7f8] max-w-4xl">
            Use Beacon without leaving the app.
          </h1>
          <p
            className="mt-4 max-w-3xl text-[15px] leading-7 text-[#9fb0b3]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Beacon today supports the dashboard, HTTP API, workflow runtime, chat delivery, and one MCP tool.
            The planned CLI and expanded MCP read surfaces are documented here clearly so operators and developers
            can see what is available now and what belongs to v2.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.28fr_0.72fr]">
          <aside className="h-fit border border-white/8 bg-black/20 p-4 lg:sticky lg:top-24">
            <div
              className="text-[10px] uppercase tracking-[0.22em] text-[#8ea1a5] mb-3"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              On this page
            </div>
            <div className="flex flex-col gap-1">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="border border-white/8 bg-white/[0.02] px-3 py-3 text-[12px] text-[#d3dcde] hover:border-cyan-400/25 hover:text-cyan-300 transition-colors"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#6d7e81] mb-1">
                    {section.label}
                  </div>
                  <div>{section.title}</div>
                </a>
              ))}
            </div>
          </aside>

          <div className="flex flex-col gap-6">
            <SectionBlock id="overview" kicker="Overview" title="What Beacon supports today">
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['Dashboard', 'Supported now', 'Run research, inspect memory, and review live progress in the web app.'],
                  ['MCP', 'Supported now', 'Expose Beacon to external agents through `/api/mcp/[...transport]` with `research_brief`.'],
                  ['CLI', 'Planned for v2', 'Documented here for roadmap clarity, but no `beacon` command ships in this repo yet.'],
                ].map(([title, status, body]) => (
                  <div key={title} className="border border-white/8 bg-black/25 p-4">
                    <div className="text-[16px] text-[#eef3f4] mb-1">{title}</div>
                    <div
                      className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 mb-2"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      {status}
                    </div>
                    <p
                      className="text-[12px] leading-6 text-[#92a5a8]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      {body}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Current entrypoints in the repo:
                dashboard pages, `POST /api/briefs`, the workflow runtime, chat webhooks, and the MCP route.
                Beacon&apos;s core workflow loads memory first and saves memory last on every run.
              </p>
            </SectionBlock>

            <SectionBlock id="mcp" kicker="MCP" title="How to use Beacon over MCP">
              <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Beacon exposes an MCP server at <code>/api/mcp/[...transport]</code>. Today it supports one tool:
                <code> research_brief(topic, recurring)</code>.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="border border-white/8 bg-black/25 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    What it does
                  </div>
                  <p className="text-[12px] leading-6 text-[#92a5a8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Starts a durable research workflow, checks whether topic memory already exists, and returns run
                    metadata plus a link to live progress.
                  </p>
                </div>
                <div className="border border-white/8 bg-black/25 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    When to use it
                  </div>
                  <p className="text-[12px] leading-6 text-[#92a5a8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Use MCP when Claude Desktop, Cursor, or another MCP-aware agent needs Beacon to own the research
                    run and maintain cross-session topic memory.
                  </p>
                </div>
              </div>
              <CodeBlock>{`Tool: research_brief
Inputs:
  - topic: string
  - recurring: boolean (default false)

Current behavior:
  1. load existing topic memory
  2. start workflow run through /api/briefs
  3. return run ID, run count, memory status, and live progress URL`}</CodeBlock>
              <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Planned v2 MCP read tools such as <code>get_topic_memory</code>, <code>get_topic_delta</code>, and
                <code> list_runs</code> are part of the roadmap, but they are not implemented yet in this repo.
              </p>
            </SectionBlock>

            <SectionBlock id="sdk" kicker="SDK + API" title="How to use Beacon from code today">
              <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                If you are integrating Beacon into another app or internal tool, the current practical path is the
                HTTP API plus the workflow backend. The main write entrypoint is <code>POST /api/briefs</code>.
              </p>
              <CodeBlock>{`POST /api/briefs
Content-Type: application/json

{
  "topic": "AI agent platform pricing and launches 2026",
  "source": "dashboard",
  "recurring": false
}`}</CodeBlock>
              <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                The response includes the workflow run ID, current source, whether prior memory exists, and the
                computed run count. Use <code>GET /api/briefs</code> to list current and recent runs in the app format.
              </p>
              <CodeBlock>{`Current integration pattern:
  - Start run: POST /api/briefs
  - List runs: GET /api/briefs
  - Inspect memory: GET /api/memory
  - Use MCP instead when your client is already MCP-aware`}</CodeBlock>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="border border-white/8 bg-black/25 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Workflow runtime
                  </div>
                  <p className="text-[12px] leading-6 text-[#92a5a8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Beacon uses the Workflow SDK for durable steps, retries, checkpointing, and recurring sleep.
                    This is why recurring research survives restarts instead of relying on fragile polling loops.
                  </p>
                </div>
                <div className="border border-white/8 bg-black/25 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Memory behavior
                  </div>
                  <p className="text-[12px] leading-6 text-[#92a5a8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Topic memory lives in Upstash Redis and is used to guide reruns toward deltas. URLs, facts, and the
                    previous summary are loaded first and persisted last.
                  </p>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock id="cli" kicker="CLI" title="CLI guide and current status">
              <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                There is no shipped <code>beacon</code> CLI in this repository today. The commands below are the intended
                v2 surface so users know the target experience clearly.
              </p>
              <CodeBlock>{`Planned CLI surface:
  beacon research
  beacon memory show
  beacon delta
  beacon sources
  beacon runs list`}</CodeBlock>
              <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Current fallback:
                use the dashboard for operator work, use <code>/api/briefs</code> and <code>/api/memory</code> for
                programmatic access, or use MCP if your client supports it.
              </p>
            </SectionBlock>

            <SectionBlock id="setup" kicker="Setup" title="Environment and local setup">
              <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Minimum environment variables:
                <code> GROQ_API_KEY</code>,
                <code> SERPAPI_API_KEY</code>,
                <code> UPSTASH_REDIS_REST_URL</code>,
                <code> UPSTASH_REDIS_REST_TOKEN</code>.
                Slack, GitHub, and Discord are optional unless you want delivery on those surfaces.
              </p>
              <CodeBlock>{`# install
npm install

# app server
npm run dev

# workflow runtime
npx workflow dev`}</CodeBlock>
              <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                For a quick local run, start both the app and the workflow runtime, then create a brief from the
                dashboard or call <code>POST /api/briefs</code>.
              </p>
            </SectionBlock>

            <SectionBlock id="troubleshooting" kicker="Troubleshooting" title="Common checks">
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['MCP tool not responding', 'Check that the app is running and that the MCP route is reachable at `/api/mcp/[...transport]`.'],
                  ['No delta on rerun', 'Confirm the topic string matches the earlier run so Beacon loads the same memory key.'],
                  ['No memory saved', 'Verify Upstash Redis URL and token are present and valid.'],
                  ['Workflow appears stuck', 'Make sure `npx workflow dev` is running locally or that the deployed workflow endpoint is healthy.'],
                ].map(([title, body]) => (
                  <div key={title} className="border border-white/8 bg-black/25 p-4">
                    <div className="text-[14px] text-[#eef3f4] mb-2">{title}</div>
                    <p className="text-[12px] leading-6 text-[#92a5a8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {body}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border border-white/8 bg-black/25 p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300 mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Useful local pages
                </div>
                <div className="flex flex-wrap gap-3 text-[12px]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300">Dashboard</Link>
                  <Link href="/memory" className="text-cyan-400 hover:text-cyan-300">Memory Bank</Link>
                  <Link href="/logs" className="text-cyan-400 hover:text-cyan-300">System Logs</Link>
                  <Link href="/briefs/new" className="text-cyan-400 hover:text-cyan-300">New Research</Link>
                </div>
              </div>
            </SectionBlock>
          </div>
        </div>
      </div>
    </div>
  )
}
