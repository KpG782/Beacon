import { DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DocsRoadmapPage() {
  return (
    <DocsShell
      eyebrow="Roadmap"
      title="What is shipped today versus what still needs product hardening."
      description="This page exists so the public surface distinguishes current capability from roadmap language, especially around privacy, security, and AI-governance maturity."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Shipped" title="Working today">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Public trial flow" body="Visitors can run a limited sample brief flow with framework selection and graph-backed result UI." />
          <DocsCard title="Private account runs" body="Signed-in users can create account-scoped runs and inspect memory, logs, report history, and stored provider-key status." />
          <DocsCard title="Persistent memory" body="Research state survives across runs and is reused to produce delta-oriented behavior." />
          <DocsCard title="MCP and API surfaces" body="Beacon exposes both private HTTP endpoints and an MCP transport route." />
        </div>
      </DocsSection>

      <DocsSection eyebrow="Needs Another Pass" title="High-value next upgrades">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard title="Deeper report modes" body="Add explicit long-form analyst output instead of only concise operator brief defaults." />
          <DocsCard title="Non-web privacy parity" body="Bind Slack and similar channels to stronger user identity if those channels should be private too." />
          <DocsCard title="Privacy request workflow" body="Add a first-class in-product path for access, deletion, export, and correction requests instead of relying mainly on operator support handling." />
          <DocsCard title="Formal legal and security maturity" body="Current legal pages are materially stronger now, but Beacon still needs vendor DPA review, transfer analysis, incident procedures, and retention governance before it should be presented as fully compliance-ready." />
        </div>
      </DocsSection>
    </DocsShell>
  )
}
