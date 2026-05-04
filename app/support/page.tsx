import Link from 'next/link'
import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function SupportPage() {
  return (
    <DocsShell
      eyebrow="Support"
      title="Troubleshoot Beacon and route privacy or governance issues clearly."
      description="Support is not only for runtime failures. Use this page for operational problems, data-handling questions, privacy requests, and practical checks against the current product posture."
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

      <DocsSection eyebrow="Privacy Requests" title="If you need data access, deletion, or key removal">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="Self-service actions"
            body="Use Settings to clear stored API keys, use Memory Bank controls to remove stored topic memory, and use your authenticated account context to review the briefs and logs that Beacon currently exposes back to you."
          />
          <DocsCard
            title="Operator review path"
            body="If you need a broader privacy review, export, correction, or deletion request across account data, memory, briefs, and logs, route it to the service operator through the project's support or repository issue channel and include the account identifier and affected run or topic where possible."
          />
          <DocsCard
            title="When to escalate immediately"
            body="Escalate immediately if you believe Beacon stored sensitive personal data by mistake, exposed another user's data, retained data after a deletion request, or processed content through the wrong integration channel."
          />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Governance" title="What support can and cannot currently guarantee">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="What is visible today"
            body="Beacon can currently surface account-scoped briefs, memory, log history, and stored-key status inside the product, which makes basic user review possible."
          />
          <DocsCard
            title="What still needs process hardening"
            body="Beacon does not yet expose a full in-product privacy request workflow, enterprise retention controls, or formal regulator-facing response procedures. Those remain operator-governed processes rather than finished product features."
          />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Reference" title="Fast paths">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard href="/docs" title="Product docs" body="Use docs for setup, API, MCP, auth, rate limits, architecture, and security guidance." />
          <DocsCard href="/privacy" title="Privacy policy" body="Review current data categories, retention, vendor processing, and user-rights posture." />
          <DocsCard href="/memory" title="Memory bank" body="Inspect the durable state Beacon has stored for your account topics." />
          <DocsCard href="/settings" title="Settings" body="Review stored provider-key status and clear configured keys from your account." />
        </div>
      </DocsSection>
    </DocsShell>
  )
}
