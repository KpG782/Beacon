import { DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

export default function TermsPage() {
  return (
    <DocsShell
      eyebrow="Terms of Service"
      title="Current usage terms for the Beacon product surface."
      description="These terms are a practical product statement for the current build and should be upgraded with formal legal review before broader production rollout."
      navItems={DOCS_NAV}
    >
      <DocsSection eyebrow="Usage" title="Allowed use">
        <DocsCard title="Research tool usage" body="Beacon is provided for research, analysis, and operator workflows. You are responsible for the content you submit and the downstream decisions you make from its outputs." />
      </DocsSection>

      <DocsSection eyebrow="Availability" title="No uptime guarantee">
        <DocsCard title="Current maturity" body="Beacon is an active product build with evolving features, documentation, and operational boundaries. Availability, output structure, and limits may change as the product matures." />
      </DocsSection>

      <DocsSection eyebrow="Responsibility" title="User responsibility">
        <DocsCard title="Independent verification" body="Research outputs should be reviewed and verified before use in high-stakes decisions. Beacon helps gather and synthesize evidence; it does not remove the need for human judgment." />
      </DocsSection>
    </DocsShell>
  )
}
