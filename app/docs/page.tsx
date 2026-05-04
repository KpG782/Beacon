import Link from 'next/link'
import { FRAMEWORKS } from '@/lib/frameworks'
import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsPage() {
  return (
    <DocsShell
      eyebrow="Public Documentation"
      title="Beacon documentation for users, operators, and developers."
      description="Beacon now exposes a public documentation surface instead of a single internal-looking notes page. Use this hub to get to quickstart, API, MCP, auth, security, deployment, architecture, roadmap, and legal guidance."
      navItems={DOCS_NAV}
      tocItems={[
        { id: 'what-beacon-is', label: 'Overview' },
        { id: 'documentation-map', label: 'Where To Start' },
        { id: 'downloadable-references', label: 'Downloads' },
        { id: 'try-beacon-via-http', label: 'API Example' },
        { id: 'why-reports-can-feel-short', label: 'Report Depth' },
        { id: `${FRAMEWORKS.length}-framework-guided-research-modes`, label: 'Frameworks' },
      ]}
      actions={
        <>
          <Link
            href="/docs/quickstart"
            className="border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-300 transition-colors hover:bg-cyan-400/12"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Open quickstart
          </Link>
          <Link
            href="/docs/api"
            className="border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[#d7e2e4] transition-colors hover:bg-white/5"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            API reference
          </Link>
        </>
      }
    >
      <DocsSection eyebrow="Overview" title="What Beacon is">
        <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Beacon is a durable web research agent with persistent memory. It plans topic-specific searches, runs web
          retrieval, synthesizes cited reports, stores facts and URLs per topic, and turns reruns into deltas instead
          of repeating the same research from scratch.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <DocsCard title="Context layer" body="Expands a topic into targeted query plans using the scout model." />
          <DocsCard title="Memory layer" body="Stores seen URLs, facts, summaries, and run history per account or trial session." />
          <DocsCard title="Harness layer" body="Runs the workflow durably with idempotent steps, durable sleep, and fallbacks." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Where To Start" title="Documentation map">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <DocsCard href="/docs/quickstart" title="Quickstart" body="Run Beacon locally, open the trial flow, and understand the main app surfaces in a few minutes." />
          <DocsCard href="/docs/frameworks" title="Framework Guide" body="Learn what each research framework does, when to use it, and how it changes Beacon's search and synthesis behavior." />
          <DocsCard href="/docs/api" title="API Reference" body="Use the authenticated HTTP surface to create research runs and read run state from code." />
          <DocsCard href="/docs/mcp" title="MCP Guide" body="Connect Beacon to external AI clients over the MCP transport route." />
          <DocsCard href="/docs/authentication" title="Authentication" body="Understand Clerk auth, public routes, and how Beacon scopes account-private data." />
          <DocsCard href="/docs/rate-limits" title="Rate Limits" body="See the actual run caps applied to research, MCP access, and login attempts." />
          <DocsCard href="/docs/security" title="Security" body="Review credential handling, account privacy, and current operational boundaries." />
          <DocsCard href="/docs/deployment" title="Deployment" body="Configure env vars and workflow runtime expectations for local or hosted deployment." />
          <DocsCard href="/docs/architecture" title="Architecture" body="Read how context, memory, harness, models, and workflow runtime fit together." />
          <DocsCard href="/docs/roadmap" title="Roadmap" body="See what is shipped today versus what is still planned or intentionally missing." />
        </div>
      </DocsSection>

      <DocsSection id="downloadable-references" eyebrow="Downloads" title="Downloadable developer references">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <DocsCard href="/api/public-download/agents" title="AGENTS.md" body="Core operating rules and project guardrails for Beacon agents." />
          <DocsCard href="/api/public-download/skill" title="SKILL.md" body="Beacon skill spec used for skills-based orchestration and behavior." />
          <DocsCard href="/api/public-download/claude" title="CLAUDE.md" body="Project-level guidance and implementation context documentation." />
          <DocsCard href="/api/public-download/architecture" title="orchestration-architecture.md" body="Full context/memory/harness architecture mapping." />
          <DocsCard href="/api/public-download/context-engineering" title="context-engineering.md" body="Per-request context strategy and optimization notes." />
          <DocsCard href="/api/public-download/memory-engineering" title="memory-engineering.md" body="Cross-session memory design and persistence patterns." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="API Example" title="Try Beacon via HTTP">
        <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Beacon&apos;s main private write surface is <code>POST /api/briefs</code>. The sample below matches the current
          backend behavior and the supported framework-driven flow.
        </p>
        <CodeBlock>{`curl -X POST http://localhost:3000/api/briefs \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <session-or-app-auth>" \\
  -d '{
    "topic": "AI coding agent benchmarks in 2026",
    "objective": "Compare major agent platforms and product positioning",
    "focus": "pricing, enterprise trust signals, SDK maturity",
    "source": "dashboard",
    "depth": "deep",
    "timeframe": "30d",
    "reportStyle": "memo",
    "frameworkId": "market-map"
  }'`}</CodeBlock>
      </DocsSection>

      <DocsSection eyebrow="Report Depth" title="Why reports can feel short">
        <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          The current research workflow is optimized for concise operator briefs, not maximum-length analyst reports.
          In <code>workflows/research.ts</code>, the synthesis prompt currently says <code>Max 600 words</code> and the
          generation call uses <code>maxTokens: 1500</code>. That combination keeps output fast and compact.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="What limits depth today" body="Short report instruction, executive-summary-first format, and moderate output token budget." />
          <DocsCard title="What to change next" body="Add a deep mode, remove the 600-word rule, raise max tokens, and require more evidence-driven sections." />
        </div>
        <CodeBlock>{`Recommended next product change:
  - keep "executive" as the concise default
  - add a "deep" or "analyst" mode
  - require sections for:
    market landscape
    evidence table
    contradictions
    implications
    open questions
  - raise synthesis token budget for deep mode`}</CodeBlock>
      </DocsSection>

      <DocsSection eyebrow="Frameworks" title={`${FRAMEWORKS.length} framework-guided research modes`}>
        <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Framework choice is behavioral, not cosmetic. Each framework contributes its own planning and synthesis hints
          so the same topic can be investigated through different research lenses.
        </p>
        <DocsCard
          href="/docs/frameworks"
          title="Open the full framework guide"
          body="Read a longer explanation for every framework in plain language and in technical terms, including when to use it and what Beacon changes under the hood."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {FRAMEWORKS.map((framework) => (
            <DocsCard
              key={framework.id}
              title={framework.name}
              body={framework.description}
            />
          ))}
        </div>
      </DocsSection>
    </DocsShell>
  )
}
