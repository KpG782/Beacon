import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsArchitecturePage() {
  return (
    <DocsShell
      eyebrow="Architecture"
      title="How Beacon's research system is structured."
      description="Beacon's core differentiator is not a landing page. It is the workflow composition across context, memory, and harness layers."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Layers" title="Core execution model">
        <div className="grid gap-3 md:grid-cols-3">
          <DocsCard title="Context" body="Plans queries, compresses search results, and guides synthesis for each run." />
          <DocsCard title="Memory" body="Loads what a topic already knows first, filters seen URLs, and saves updated state last." />
          <DocsCard title="Harness" body="Keeps step behavior idempotent, resilient, and durable across recurring runs." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Workflow" title="Research run flow">
        <CodeBlock>{`1. loadMemory
2. planQueries
3. runSerpQuery in parallel
4. synthesizeReport
5. saveMemory
6. optional recurring sleep and rerun`}</CodeBlock>
      </DocsSection>

      <DocsSection eyebrow="Model Rules" title="Approved model layer">
        <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Beacon uses <code>scoutModel</code> for tool use and planning and <code>synthModel</code> for writing, both
          sourced from <code>@/lib/groq</code>. Direct provider imports outside that abstraction are intentionally not
          part of the repo contract.
        </p>
      </DocsSection>
    </DocsShell>
  )
}
