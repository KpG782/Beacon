import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsSecurityPage() {
  return (
    <DocsShell
      eyebrow="Security"
      title="Current security posture and operational boundaries."
      description="Beacon is stronger than before on account privacy and credential separation, but this page is intentionally direct about what is already hardened and what is still product-maturity work."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Current Strengths" title="What Beacon already does">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Per-account privacy" body="Authenticated briefs, memory, and logs are now isolated by Clerk user ID in the web app." />
          <DocsCard title="Trial isolation" body="Public trial data is isolated by session cookie and IP-based allowance instead of global shared state." />
          <DocsCard title="BYOK support" body="User-supplied Groq and SerpAPI keys are accepted for private brief runs and are not logged intentionally." />
          <DocsCard title="MCP bearer auth" body="External MCP clients can authenticate with a dedicated token instead of browser cookies." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Current Limits" title="What is not yet a finished security platform">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="No formal whitepaper" body="This page documents behavior, but Beacon does not yet ship a full security whitepaper or audit package." />
          <DocsCard title="Non-web identity mapping" body="Slack or similar chat-bot channels still need stronger user-identity binding if they should inherit the same privacy model." />
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
