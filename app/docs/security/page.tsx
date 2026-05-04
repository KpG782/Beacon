import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsSecurityPage() {
  return (
    <DocsShell
      eyebrow="Security"
      title="Current security posture, privacy controls, and known governance gaps."
      description="Beacon is materially stronger than its initial hackathon baseline, but this page is intentionally direct about the difference between implemented controls and a finished compliance program."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Current Strengths" title="What Beacon already does">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Per-account privacy" body="Authenticated briefs, memory, and logs are scoped by Clerk user ID in the web app so one signed-in account does not see another account's data." />
          <DocsCard title="Trial isolation" body="Public trial usage is separated by session cookie and IP-based allowance instead of a single global shared state." />
          <DocsCard title="Encrypted BYOK storage" body="User-supplied Groq and SerpAPI keys can be stored through an authenticated route and are encrypted before being written to Redis." />
          <DocsCard title="MCP bearer auth" body="External MCP clients can authenticate with a dedicated token instead of relying on browser cookies." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Privacy Controls" title="What supports a more credible privacy posture">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Retention windows are defined" body="Current implementation defines 30-day TTLs for memory and brief records and a 90-day TTL for saved provider keys. That is better than indefinite retention, even though it is not yet a full retention-control suite." />
          <DocsCard title="User-visible data review" body="Authenticated users can review memory, briefs, logs, and stored-key status through product surfaces, which supports basic access and deletion workflows." />
          <DocsCard title="Key material is masked in UI" body="The key-management API never returns raw saved credentials to the browser after storage; the UI only receives masked status." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Current Limits" title="What is not yet a finished security or compliance platform">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="No formal audit package" body="Beacon still does not ship a formal security whitepaper, penetration test report, SOC package, or enterprise DPA workflow." />
          <DocsCard title="Non-web identity mapping" body="Slack or similar chat-bot channels still need stronger user identity binding if they should inherit the same privacy guarantees as the signed-in web app." />
          <DocsCard title="Log governance needs another pass" body="Operational logs are retained as a rolling capped list rather than a formal retention schedule with documented deletion, minimization, and legal-hold controls." />
          <DocsCard title="Governance process is still operator-led" body="Privacy requests, incident handling, and transfer assessments still depend on product/operator process rather than a fully built in-app governance workflow." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Environment" title="Sensitive configuration">
        <CodeBlock>{`Core secrets:
  GROQ_API_KEY
  SERPAPI_API_KEY
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN
  CLERK_SECRET_KEY

Optional auth tokens:
  BEACON_MCP_TOKEN
  BEACON_PASSWORD
  BEACON_SESSION_TOKEN`}</CodeBlock>
      </DocsSection>
    </DocsShell>
  )
}
