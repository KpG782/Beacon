import { DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function DisclaimerPage() {
  return (
    <DocsShell
      eyebrow="Disclaimer"
      title="Important limits on Beacon research output."
      description="Beacon is a research agent, not an oracle. This page makes the core boundaries explicit."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Output Limits" title="Research output can be incomplete or wrong">
        <DocsCard title="Evidence-driven, not certainty-driven" body="Beacon synthesizes from retrieved sources and model reasoning. Results can miss context, inherit source errors, or reflect incomplete retrieval coverage." />
      </DocsSection>

      <DocsSection eyebrow="High Stakes" title="Do not rely without review">
        <DocsCard title="Human review required" body="Outputs should not be treated as sole authority for medical, legal, financial, employment, compliance, or other high-stakes decisions without independent verification." />
      </DocsSection>
    </DocsShell>
  )
}
