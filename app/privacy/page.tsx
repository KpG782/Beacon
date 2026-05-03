import { DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function PrivacyPage() {
  return (
    <DocsShell
      eyebrow="Privacy Policy"
      title="How Beacon handles research data and credentials."
      description="This is a product-facing privacy page for the current Beacon build. It reflects current behavior in the web app rather than a formal outside-counsel legal package."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Data" title="What Beacon stores">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Research records" body="Beacon stores brief metadata, run status, logs, facts, source URLs, summaries, and memory history so later runs can reuse state." />
          <DocsCard title="Auth identity" body="Authenticated web usage is scoped by Clerk user ID to keep account data separated." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Isolation" title="How Beacon limits data exposure">
        <DocsCard title="Account privacy" body="The current web app isolates briefs, memory, and logs per user account. Trial data is isolated separately by session." />
      </DocsSection>

      <DocsSection eyebrow="Credentials" title="Key handling">
        <DocsCard title="Operator and user keys" body="Beacon uses server environment variables for default operation and can accept user-provided Groq and SerpAPI keys for private runs. Keys should be treated as sensitive and should not be logged or shared." />
      </DocsSection>
    </DocsShell>
  )
}
