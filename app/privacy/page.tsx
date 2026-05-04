import Link from 'next/link'
import { DOCS_NAV, DocsCard, DocsSection, DocsShell } from '@/components/docs/docs-shell'

const TOC = [
  { id: 'scope', label: 'Scope' },
  { id: 'data-we-process', label: 'Data Categories' },
  { id: 'why-we-use-data', label: 'Purposes And Legal Bases' },
  { id: 'ai-processing', label: 'AI Processing' },
  { id: 'sharing', label: 'Sharing And Transfers' },
  { id: 'retention', label: 'Retention' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'security', label: 'Security And Limits' },
]

export default function PrivacyPage() {
  return (
    <DocsShell
      eyebrow="Privacy Policy"
      title="How Beacon processes research data, account data, and AI-generated output."
      description="Effective May 4, 2026. This policy is written for the current Beacon build and is intended to cover the practical privacy, AI-governance, and data-handling issues this product raises. It is stronger than the previous placeholder, but it is still not a substitute for jurisdiction-specific legal review or a negotiated enterprise DPA."
      navItems={DOCS_NAV}
      tocItems={TOC}
      actions={
        <Link
          href="/disclaimer"
          className="border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-200 transition-colors hover:bg-cyan-400/[0.1]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Review AI disclaimer
        </Link>
      }
    >
      <DocsSection id="scope" eyebrow="Scope" title="What this policy covers">
        <DocsCard
          title="Product scope"
          body="This policy covers Beacon's web app, trial flow, API routes, durable workflow runs, memory features, and connected chat-bot intake channels where enabled. It applies to personal data contained in account records, submitted prompts, research topics, generated reports, URLs, snippets, logs, and user-provided API credentials."
        />
        <DocsCard
          title="Controller and operator posture"
          body="Beacon is currently a product-operated service, not a no-data relay. That means the service operator and its infrastructure providers process submitted content in order to run research, store memory, enforce limits, and return reports. If you submit data about other people, you are responsible for having a valid legal basis and authority to do so."
        />
        <DocsCard
          title="What this policy does not promise"
          body="This page does not claim that Beacon is already fully certified, fully audited, or fully compliant with every jurisdiction's requirements. It states the current processing model and the controls the product is intended to follow so those controls can be tested and improved."
        />
      </DocsSection>

      <DocsSection id="data-we-process" eyebrow="Data" title="Categories of data Beacon processes">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="Account and identity data"
            body="For signed-in web usage, Beacon processes account identifiers supplied by Clerk, such as user ID and basic session context, in order to authenticate the user and separate one account's briefs, memory, logs, and saved keys from another's."
          />
          <DocsCard
            title="Research input data"
            body="Beacon processes the topic, objective, focus areas, framework selection, recurrence settings, source channel, and any other content submitted in a brief. That content may itself contain personal data if the user includes it."
          />
          <DocsCard
            title="Research output and memory data"
            body="Beacon stores report content, summary text, source URLs, snippets, query plans, run status, delta URLs, extracted key facts, and memory history so the next run can reuse prior state instead of starting from zero."
          />
          <DocsCard
            title="Trial and anti-abuse data"
            body="The public trial flow uses a session cookie and IP-based allowance checks to limit abuse and separate trial activity. This means Beacon may process trial session identifiers, basic request metadata, and coarse network identifiers for rate-limiting and service protection."
          />
          <DocsCard
            title="Logs and operational telemetry"
            body="Beacon records workflow, memory, system, and provider-related log events so the operator can diagnose failures, confirm runs completed, and investigate abuse or instability. Logs may include timestamps, run IDs, user scope, category labels, and error messages."
          />
          <DocsCard
            title="User-provided API keys"
            body="If you configure your own Groq or SerpAPI credentials, Beacon stores them server-side in encrypted form tied to your account. They are used only to execute your research runs and are not intentionally returned in plaintext through the product UI."
          />
          <DocsCard
            title="Chat channel metadata"
            body="If Slack or similar adapters are enabled, Beacon may process channel, thread, and message metadata necessary to receive a prompt and post status updates. Those integrations currently require additional identity and governance hardening before they should be treated as equivalent to the signed-in web app for confidential workloads."
          />
        </div>
      </DocsSection>

      <DocsSection id="why-we-use-data" eyebrow="Lawful Use" title="Why Beacon uses personal data and the likely legal bases">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="Provide the service"
            body="Beacon uses submitted data to authenticate users, accept briefs, search the web, synthesize reports, show sources, and persist memory. For most user-facing activity, the most likely legal basis is performance of a contract or pre-contract product use initiated by the user."
          />
          <DocsCard
            title="Secure and improve operations"
            body="Beacon uses logs, rate-limit data, and run metadata to keep the service available, prevent abuse, debug failures, and improve reliability. The likely legal basis for this processing is legitimate interests in operating a secure research system."
          />
          <DocsCard
            title="Optional stored credentials and integrations"
            body="If a user chooses to save personal provider keys or connect an external channel, Beacon processes that information to honor the user's configuration. Depending on implementation and jurisdiction, the likely basis is consent, contract necessity, or both."
          />
          <DocsCard
            title="No hidden ad-tech profiling"
            body="Beacon is not intended to sell personal data or build advertising profiles from research activity. Its processing is supposed to remain tied to research execution, persistence, security, and support."
          />
        </div>
      </DocsSection>

      <DocsSection id="ai-processing" eyebrow="AI Governance" title="How AI processing works and the limits Beacon applies">
        <DocsCard
          title="AI-assisted research, not autonomous authority"
          body="Beacon uses LLMs from Groq for planning and writing and uses SerpAPI for retrieval. Outputs are generated from retrieved web results plus model reasoning. They can be incomplete, stale, biased, or wrong, and they should not be treated as a sole basis for legal, medical, financial, employment, safety, or other high-stakes decisions."
        />
        <DocsCard
          title="No solely automated decisions for high-risk outcomes"
          body="Beacon is intended as an assistive research tool. It is not meant to make binding decisions about a person's rights, eligibility, employment, health, credit, or legal position without meaningful human review. Users remain responsible for review, verification, and downstream use."
        />
        <DocsCard
          title="Sensitive and regulated data warning"
          body="Do not submit special-category personal data, health data, biometric data, government identifiers, trade secrets, or confidential third-party material unless you have a clear legal basis, an internal approval path, and a deployment setup that is explicitly approved for that class of data."
        />
        <DocsCard
          title="Fairness, provenance, and contestability"
          body="Beacon is designed to keep source URLs and memory history so findings can be reviewed rather than accepted blindly. That supports provenance and contestability, but it does not eliminate model error. Human review and source checking remain required."
        />
      </DocsSection>

      <DocsSection id="sharing" eyebrow="Vendors" title="Who Beacon shares data with and how transfers may occur">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="Core infrastructure providers"
            body="Based on the current implementation, Beacon relies on third-party providers including Clerk for authentication, Upstash Redis for memory, brief, key, and log storage, Groq for LLM inference, SerpAPI for search retrieval, and Vercel or equivalent hosting/runtime infrastructure for serving the application and workflows."
          />
          <DocsCard
            title="Connected channels"
            body="If Slack, GitHub, Discord, or similar adapters are enabled, relevant prompt and message data may also be processed by those platforms to deliver messages and status updates."
          />
          <DocsCard
            title="Cross-border transfers"
            body="Because Beacon uses cloud infrastructure and model providers, personal data may be processed in countries other than the one where the user is located. If GDPR or similar transfer rules apply, the operator should ensure an appropriate transfer mechanism and vendor terms are in place before using Beacon for regulated production workloads."
          />
          <DocsCard
            title="No blanket public disclosure"
            body="Beacon is not intended to publish private briefs or memory to the public. However, users should assume anything they submit is disclosed to the subprocessors necessary to provide the service and should avoid submitting unnecessary personal data."
          />
        </div>
      </DocsSection>

      <DocsSection id="retention" eyebrow="Retention" title="How long Beacon keeps data">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="Memory records"
            body="Topic memory in Upstash currently has a 30-day TTL. That means saved memory is intended to expire about 30 days after it is written unless a later run refreshes it."
          />
          <DocsCard
            title="Brief records"
            body="Persisted brief records currently have a 30-day TTL. They are intended to remain available for account history and rerun context during that window."
          />
          <DocsCard
            title="Saved API keys"
            body="User-supplied Groq and SerpAPI keys currently have a 90-day TTL in storage unless the user deletes them sooner."
          />
          <DocsCard
            title="Logs"
            body="Operational logs are currently retained as a rolling capped list rather than a clean legal retention schedule. In practice, recent entries are preserved until overwritten by newer ones. This area should be tightened if the product is moved into a more formal compliance posture."
          />
          <DocsCard
            title="Trial data"
            body="Trial allowance state is tied to a trial session identifier and IP-based limit window. Users should treat the trial surface as lower-assurance than an authenticated private account."
          />
        </div>
      </DocsSection>

      <DocsSection id="rights" eyebrow="Rights" title="Privacy rights Beacon intends to support">
        <div className="grid gap-3 md:grid-cols-2">
          <DocsCard
            title="Access, correction, deletion, portability"
            body="If GDPR, UK GDPR, or similar rules apply, users may have rights to request access to their personal data, correction of inaccurate data, deletion, restriction, objection, and export of the data associated with their use of Beacon, subject to legal exceptions."
          />
          <DocsCard
            title="How to exercise rights"
            body="At a minimum, the product should allow users to delete saved API keys, remove memory entries, and close their account-facing access paths. For broader privacy requests, contact the service operator through the support flow so the relevant account, memory, brief, and log records can be reviewed."
          />
          <DocsCard
            title="Consent withdrawal"
            body="Where processing depends on consent, users should be able to withdraw that consent by disconnecting the optional feature or requesting deletion of the related stored data. Withdrawal does not retroactively invalidate prior lawful processing."
          />
          <DocsCard
            title="Complaints"
            body="Users covered by GDPR or similar frameworks may also have the right to complain to their local supervisory authority if they believe their data has been processed unlawfully."
          />
        </div>
      </DocsSection>

      <DocsSection id="security" eyebrow="Security" title="Security controls, current gaps, and compliance posture">
        <DocsCard
          title="Current controls"
          body="Beacon currently separates authenticated web data by Clerk user ID, encrypts saved user API keys before storing them in Redis, rate-limits trial and API activity, and keeps memory, brief, and log stores namespaced by user scope."
        />
        <DocsCard
          title="Current limitations"
          body="Beacon does not yet represent a complete enterprise privacy or AI-governance program. The operator should still validate vendor DPAs, transfer terms, security headers, log governance, incident response, deletion workflows, and non-web identity controls before representing the service as fully compliance-ready."
        />
        <DocsCard
          title="Practical compliance statement"
          body="This page is intended to close the major disclosure gap that would otherwise make the app look legally under-specified. It should help Beacon present a more credible baseline for GDPR-style transparency, AI governance, and responsible-use review, but it should not be used as a final claim of legal sufficiency without counsel review."
        />
      </DocsSection>
    </DocsShell>
  )
}
