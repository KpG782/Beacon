import Link from 'next/link'

function SupportCard({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="border border-white/8 bg-black/20 p-5">
      <div className="text-[18px] leading-6 text-[#eef3f4] mb-2">{title}</div>
      <p className="text-[13px] leading-7 text-[#9aabad]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        {body}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto border border-white/8 bg-black/30 p-4 text-[12px] leading-6 text-[#d3dddf]">
      <code style={{ fontFamily: 'var(--font-space-grotesk)' }}>{children}</code>
    </pre>
  )
}

export default function SupportPage() {
  return (
    <div className="px-8 py-8">
      <div className="flex flex-col gap-8">
        <div className="border border-amber-300/15 bg-amber-300/[0.04] p-8">
          <div
            className="text-[11px] uppercase tracking-[0.24em] text-amber-300 mb-3"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Support
          </div>
          <h1 className="text-4xl md:text-5xl tracking-[-0.04em] text-[#f3f7f8] max-w-4xl">
            Troubleshoot Beacon without leaving the app.
          </h1>
          <p
            className="mt-4 max-w-3xl text-[15px] leading-7 text-[#a7b4b7]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            This page is for support, not product docs. Use it for setup checks, runtime problems, memory issues,
            workflow issues, and quick recovery steps.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.35fr_0.65fr]">
          <aside className="h-fit border border-white/8 bg-black/20 p-4 lg:sticky lg:top-24">
            <div
              className="text-[10px] uppercase tracking-[0.22em] text-[#8ea1a5] mb-3"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Fast paths
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/docs" className="border border-white/8 bg-white/[0.02] px-3 py-3 text-[12px] text-[#d3dcde] hover:border-cyan-400/25 hover:text-cyan-300 transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Product docs
              </Link>
              <Link href="/logs" className="border border-white/8 bg-white/[0.02] px-3 py-3 text-[12px] text-[#d3dcde] hover:border-cyan-400/25 hover:text-cyan-300 transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                System logs
              </Link>
              <Link href="/memory" className="border border-white/8 bg-white/[0.02] px-3 py-3 text-[12px] text-[#d3dcde] hover:border-cyan-400/25 hover:text-cyan-300 transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Memory bank
              </Link>
              <Link href="/briefs/new" className="border border-white/8 bg-white/[0.02] px-3 py-3 text-[12px] text-[#d3dcde] hover:border-cyan-400/25 hover:text-cyan-300 transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Start new run
              </Link>
            </div>
          </aside>

          <div className="flex flex-col gap-6">
            <SupportCard
              title="If Beacon is not starting runs"
              body="Check that the app server is running, the workflow runtime is available, and the request payload includes a topic. The app starts research through POST /api/briefs."
            />

            <SupportCard
              title="If recurring research is not waking up"
              body="Beacon relies on the Workflow SDK for durable sleep and resume. Locally, make sure `npx workflow dev` is running. In deployment, confirm the workflow endpoint is healthy."
            />

            <SupportCard
              title="If memory is missing or reruns are not producing a delta"
              body="Use the exact same topic string across runs so Beacon resolves the same memory key. Then verify that Upstash Redis credentials are present and valid."
              action={
                <CodeBlock>{`Checks:
  1. open Memory Bank
  2. confirm the topic already exists
  3. verify UPSTASH_REDIS_REST_URL
  4. verify UPSTASH_REDIS_REST_TOKEN
  5. rerun the exact same topic`}</CodeBlock>
              }
            />

            <SupportCard
              title="If MCP is not working"
              body="Beacon's current MCP surface is the route at `/api/mcp/[...transport]` and the tool `research_brief`. If the MCP client cannot call Beacon, first confirm the app route is reachable, then confirm the client is pointed at the correct deployment URL."
            />

            <SupportCard
              title="If you expected a CLI"
              body="There is no shipped `beacon` CLI in this repo today. That is a documented v2 plan. For now, use the dashboard, the HTTP API, or the MCP tool depending on your workflow."
            />

            <div className="border border-white/8 bg-white/[0.02] p-6">
              <div
                className="text-[10px] uppercase tracking-[0.22em] text-amber-300 mb-3"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Local setup checklist
              </div>
              <CodeBlock>{`Required core env:
  GROQ_API_KEY
  SERPAPI_API_KEY
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN

Run locally:
  npm install
  npm run dev
  npx workflow dev`}</CodeBlock>
            </div>

            <div className="border border-cyan-400/15 bg-cyan-400/[0.04] p-6">
              <div
                className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-2"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Need usage guidance instead?
              </div>
              <p className="text-[13px] leading-7 text-[#9fb0b3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Use the Docs page for MCP usage, SDK/API integration, CLI roadmap status, and product-level setup guidance.
              </p>
              <div className="mt-4">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-300 hover:bg-cyan-400/12 transition-colors"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Open docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
