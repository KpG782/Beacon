import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsDeploymentPage() {
  return (
    <DocsShell
      eyebrow="Deployment"
      title="Deploy Beacon with the workflow runtime and memory dependencies intact."
      description="Beacon is not just a static Next.js app. Durable research depends on model keys, SerpAPI, Redis, auth, and the workflow runtime being configured coherently."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Required Services" title="Deployment dependencies">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Groq" body="Provides the scout and synthesis models through the repo's approved Groq abstraction layer." />
          <DocsCard title="SerpAPI" body="Provides web search results for the research workflow." />
          <DocsCard title="Upstash Redis" body="Stores memory, brief indexes, logs, and rate-limit counters." />
          <DocsCard title="Workflow runtime" body="Required for durable execution, resumable steps, and zero-compute sleep." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Checklist" title="Deployment checklist">
        <CodeBlock>{`1. set all required env vars
2. confirm Clerk keys for auth flows
3. confirm workflow endpoints are reachable
4. verify Redis connectivity
5. verify /trial, /docs, and private /dashboard flows
6. verify recurring runs if you depend on sleep/resume behavior`}</CodeBlock>
      </DocsSection>
    </DocsShell>
  )
}
