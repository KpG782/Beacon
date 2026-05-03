import { CodeBlock, DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsRateLimitsPage() {
  return (
    <DocsShell
      eyebrow="Rate Limits"
      title="Current request caps and why they exist."
      description="Beacon protects expensive surfaces because research runs consume model and search budget."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Configured Limits" title="Current limits in code">
        <CodeBlock>{`Research: 5 runs per hour per IP
MCP:      15 requests per hour per IP
Login:    10 attempts per 15 minutes per IP`}</CodeBlock>
      </DocsSection>

      <DocsSection eyebrow="Enforcement" title="How rate limiting behaves">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Storage" body="Beacon uses an Upstash-backed sliding-window counter keyed by action and identifier." />
          <DocsCard title="Fallback behavior" body="If Redis is unavailable, the limiter currently degrades open instead of blocking all traffic." />
        </div>
      </DocsSection>
    </DocsShell>
  )
}
