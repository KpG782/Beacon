import Link from 'next/link'
import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function SupportPage() {
  return (
    <DocsShell
      eyebrow="Support"
      title="Troubleshoot Beacon without leaving the app."
      description="Support is separate from docs. Use this page for runtime failures, memory issues, workflow wake-up problems, and recovery checks."
      navItems={DOCS_NAV}
      actions={
        <Link
          href="/logs"
          className="border border-amber-300/20 bg-amber-300/[0.06] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-amber-200 transition-colors hover:bg-amber-300/[0.1]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Open logs
        </Link>
      }
    >
      <DocsSection eyebrow="Runtime" title="If Beacon is not starting runs">
        <DocsCard
          title="Checks"
          body="Confirm the app server is up, the workflow runtime is reachable, the request payload includes a topic, and the account is authenticated for private /api/briefs usage."
        />
      </DocsSection>

      <DocsSection eyebrow="Recurring Workflows" title="If recurring research is not waking up">
        <DocsCard
          title="Workflow requirement"
          body="Beacon relies on durable workflow sleep and resume. Locally, keep `npx workflow dev` running. In deployment, confirm workflow endpoints and runtime hooks are healthy."
        />
      </DocsSection>

      <DocsSection eyebrow="Memory" title="If reruns are not producing a delta">
        <CodeBlock>{`Checks:
  1. use the exact same topic string
  2. open /memory and confirm the topic exists
  3. verify UPSTASH_REDIS_REST_URL
  4. verify UPSTASH_REDIS_REST_TOKEN
  5. rerun after memory is present`}</CodeBlock>
      </DocsSection>

      <DocsSection eyebrow="Reference" title="Fast paths">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard href="/docs" title="Product docs" body="Use docs for setup, API, MCP, auth, rate limits, and architecture guidance." />
          <DocsCard href="/memory" title="Memory bank" body="Inspect the durable state Beacon has stored for your account topics." />
          <DocsCard href="/logs" title="System logs" body="Inspect workflow and memory logs for the current account." />
          <DocsCard href="/trial" title="Trial flow" body="Use the public sample brief surface to validate end-to-end behavior quickly." />
        </div>
      </DocsSection>
    </DocsShell>
  )
}
