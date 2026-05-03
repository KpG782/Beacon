import { DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsRoadmapPage() {
  return (
    <DocsShell
      eyebrow="Roadmap"
      title="What is shipped today versus what still needs product hardening."
      description="This page exists so the public surface distinguishes current capability from roadmap language."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Shipped" title="Working today">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Public trial flow" body="Visitors can run a limited sample brief flow with framework selection and graph-backed result UI." />
          <DocsCard title="Private account runs" body="Signed-in users can create account-scoped runs and inspect memory, logs, and report history." />
          <DocsCard title="Persistent memory" body="Research state survives across runs and is reused to produce delta-oriented behavior." />
          <DocsCard title="MCP and API surfaces" body="Beacon exposes both private HTTP endpoints and an MCP transport route." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Needs Another Pass" title="High-value next upgrades">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Deeper report modes" body="Add explicit long-form analyst output instead of only concise operator brief defaults." />
          <DocsCard title="Non-web privacy parity" body="Bind Slack and similar channels to stronger user identity if those channels should be private too." />
          <DocsCard title="Expanded developer packaging" body="Add a cleaner API story, stronger MCP examples, and more operational reference material." />
          <DocsCard title="Formal legal and security maturity" body="Current pages are present, but they are product-owned docs rather than a formal compliance package." />
        </div>
      </DocsSection>
    </DocsShell>
  )
}
