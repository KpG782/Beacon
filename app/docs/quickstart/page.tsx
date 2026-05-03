import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsQuickstartPage() {
  return (
    <DocsShell
      eyebrow="Quickstart"
      title="Get Beacon running locally in a few minutes."
      description="This path gets you from clone to first trial run with the least friction."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Install" title="1. Start the app and workflow runtime">
        <CodeBlock>{`npm install
npm run dev
npx workflow dev`}</CodeBlock>
        <p className="text-[13px] leading-7 text-[#a3b2b5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Beacon uses Next.js for the web app and the Workflow SDK for durable research execution. Both need to be
          available during local development.
        </p>
      </DocsSection>

      <DocsSection eyebrow="Environment" title="2. Provide required credentials">
        <CodeBlock>{`Required env vars:
  GROQ_API_KEY
  SERPAPI_API_KEY
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN

Optional auth and agent env:
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  BEACON_MCP_TOKEN
  BEACON_PASSWORD
  BEACON_SESSION_TOKEN`}</CodeBlock>
      </DocsSection>

      <DocsSection eyebrow="Open Surfaces" title="3. Use the right entrypoint">
        <div className="grid gap-3 md:grid-cols-3">
          <DocsCard title="/trial" body="Public sample brief flow with framework selection and graph-backed progress/result UI." />
          <DocsCard title="/dashboard" body="Private operator surface for full research runs, memory inspection, and key management." />
          <DocsCard title="/docs" body="Public documentation hub for API, MCP, auth, security, and deployment guidance." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="First Run" title="4. Verify the workflow path">
        <CodeBlock>{`Recommended local check:
  1. open /trial
  2. submit a sample brief
  3. confirm the run page streams from "running" to a final report
  4. rerun the same topic in /dashboard and verify memory reuse`}</CodeBlock>
      </DocsSection>
    </DocsShell>
  )
}
