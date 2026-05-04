import Link from 'next/link'
import {
  CodeBlock,
  DOCS_NAV,
  DocsCard,
  DocsSection,
  DocsShell,
} from '@/components/docs/docs-shell'
import {
  FRAMEWORK_CATEGORIES,
  FRAMEWORKS_BY_CATEGORY,
  type FrameworkCategory,
  type FrameworkOption,
} from '@/lib/frameworks'

const CATEGORY_GUIDE: Record<
  FrameworkCategory,
  { layman: string; technical: string; useCase: string }
> = {
  'Discovery & Framing': {
    layman:
      'Use these when the team is still trying to understand the problem clearly. They help you avoid building a solution for a fuzzy or badly defined need.',
    technical:
      'These frameworks bias query planning toward problem definition, unmet needs, causal structure, and the difference between symptoms and root causes.',
    useCase:
      'Best for early-stage idea validation, startup discovery, hackathon framing, and "what exactly is the problem?" work.',
  },
  'User Research': {
    layman:
      'Use these when you want to understand people better: what they do, what they feel, what frustrates them, and what really matters in their experience.',
    technical:
      'These frameworks push Beacon toward voice-of-customer evidence, behavior patterns, journey analysis, emotional signals, and segmentation logic.',
    useCase:
      'Best for customer discovery, UX research, feature design, onboarding analysis, and product teams trying to reduce guesswork.',
  },
  Prioritization: {
    layman:
      'Use these when you already have multiple ideas and need a reasoned way to rank them instead of arguing from instinct.',
    technical:
      'These frameworks reshape synthesis toward scoring criteria, trade-off logic, opportunity ranking, effort estimates, and evidence-backed decision ordering.',
    useCase:
      'Best for roadmap planning, feature selection, hackathon scope control, and deciding what should be done first.',
  },
  'Systems Thinking': {
    layman:
      'Use these when the issue is bigger than one feature or one user complaint. They help explain how a whole system behaves and why simple fixes often fail.',
    technical:
      'These frameworks bias the agent toward loops, structures, incentives, environmental factors, stakeholder power, and second-order effects.',
    useCase:
      'Best for policy-heavy problems, market structure analysis, organizational issues, long-running product problems, and ecosystem mapping.',
  },
  Strategy: {
    layman:
      'Use these when you need to understand competition, positioning, moats, market structure, or how to win rather than just how to build.',
    technical:
      'These frameworks emphasize industry forces, competitive differentiation, value creation, market design, and durable advantage.',
    useCase:
      'Best for founder strategy, GTM planning, category analysis, investor-facing research, and competitive intelligence.',
  },
  Validation: {
    layman:
      'Use these when the question is not "is this interesting?" but "what is the fastest way to prove whether this deserves investment?"',
    technical:
      'These frameworks direct Beacon toward demand signals, cheap experiments, measurable proof points, and test design rather than broad descriptive research.',
    useCase:
      'Best for MVP testing, startup validation, fake-door experiments, north-star thinking, and pre-build risk reduction.',
  },
  'AI/Deep Research': {
    layman:
      'Use these when the question is complex and you want the reasoning process itself to be more explicit, critical, or multi-angled than a normal summary.',
    technical:
      'These frameworks modify the reasoning shape of the final report: decomposition, adversarial review, scenarios, analogies, and structured perspective-taking.',
    useCase:
      'Best for nuanced analysis, high-ambiguity questions, strategic bets, technical research, and questions where blind spots matter.',
  },
}

function titleCaseSentence(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function plainEnglish(framework: FrameworkOption): string {
  const description = framework.description.endsWith('.')
    ? framework.description.slice(0, -1)
    : framework.description

  switch (framework.category) {
    case 'Discovery & Framing':
      return `In plain English: ${titleCaseSentence(description)}. This is the kind of framework you use when the team still needs to agree on what the actual problem is before jumping to a solution.`
    case 'User Research':
      return `In plain English: ${titleCaseSentence(description)}. It helps turn scattered user signals into a more readable picture of what people really need and how they behave.`
    case 'Prioritization':
      return `In plain English: ${titleCaseSentence(description)}. It is useful when you have too many possible actions and need a defensible way to rank them.`
    case 'Systems Thinking':
      return `In plain English: ${titleCaseSentence(description)}. It helps you look at the whole system around the problem instead of only one isolated symptom.`
    case 'Strategy':
      return `In plain English: ${titleCaseSentence(description)}. It is for understanding how to compete, where advantage comes from, and how the market is structured.`
    case 'Validation':
      return `In plain English: ${titleCaseSentence(description)}. It is meant to reduce waste by proving or disproving an idea before too much time or money gets committed.`
    case 'AI/Deep Research':
      return `In plain English: ${titleCaseSentence(description)}. It changes the reasoning style of the research so the answer is more explicit, critical, or multi-perspective than a generic summary.`
  }
}

function whenToUse(framework: FrameworkOption): string {
  return `Use ${framework.name} when you need research shaped around ${framework.category.toLowerCase()} work and you want Beacon to bias both the search plan and the final report toward that method instead of a generic overview.`
}

function exampleQuestions(framework: FrameworkOption): string[] {
  return [
    `What kind of question is ${framework.name} best at answering?`,
    `What evidence should matter most under this framework?`,
    `What decision becomes easier after running this framework?`,
  ]
}

function frameworkSectionItems() {
  return FRAMEWORK_CATEGORIES.map((category) => ({
    id: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    label: category,
  }))
}

export default function DocsFrameworksPage() {
  return (
    <DocsShell
      eyebrow="Framework Guide"
      title="How Beacon's research frameworks actually work."
      description="This guide explains every framework in both plain language and technical terms. Use it when you need to know not just what a framework is called, but why it exists, when to use it, and how it changes Beacon's behavior."
      navItems={DOCS_NAV}
      tocItems={frameworkSectionItems()}
      actions={
        <>
          <Link
            href="/trial"
            className="border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-300 transition-colors hover:bg-cyan-400/12"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Try a framework
          </Link>
          <Link
            href="/docs"
            className="border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[#d7e2e4] transition-colors hover:bg-white/5"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Back to docs
          </Link>
        </>
      }
    >
      <DocsSection eyebrow="How To Choose" title="Choosing the right framework">
        <div className="grid gap-3 md:grid-cols-3">
          <DocsCard
            title="Start with the decision"
            body="Do not choose a framework because the name sounds smart. Choose it based on the decision you need to make: define the problem, understand users, prioritize work, test an idea, or shape strategy."
          />
          <DocsCard
            title="Use plain-language intent"
            body="A good rule of thumb is: if you can explain what you need in simple terms, there is usually a matching framework family. Beacon then translates that method into search behavior and report structure."
          />
          <DocsCard
            title="Know what changes technically"
            body="The framework is not just a label. It changes what Beacon searches for, what kinds of evidence it prioritizes, and how the final synthesis is organized."
          />
        </div>
        <CodeBlock>{`Fast shortcut:
  Define the problem      -> Discovery & Framing
  Understand people       -> User Research
  Rank options            -> Prioritization
  Explain the whole system-> Systems Thinking
  Compete or position     -> Strategy
  Test before building    -> Validation
  Go deeper on reasoning  -> AI/Deep Research`}</CodeBlock>
      </DocsSection>

      {FRAMEWORK_CATEGORIES.map((category) => {
        const intro = CATEGORY_GUIDE[category]
        const frameworks = FRAMEWORKS_BY_CATEGORY[category] ?? []

        return (
          <DocsSection
            key={category}
            id={category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
            eyebrow="Category"
            title={category}
          >
            <div className="grid gap-3 md:grid-cols-3">
              <DocsCard title="In plain terms" body={intro.layman} />
              <DocsCard title="Technical effect" body={intro.technical} />
              <DocsCard title="Best use cases" body={intro.useCase} />
            </div>

            {frameworks.map((framework) => (
              <div key={framework.id} className="border border-white/8 bg-black/20 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-[18px] text-[#eef3f4]">{framework.name}</div>
                  <span
                    className="border border-cyan-400/20 bg-cyan-400/8 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-300"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {framework.id}
                  </span>
                </div>

                <p
                  className="mt-3 text-[13px] leading-7 text-[#d3dcde]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {framework.description}
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <DocsCard title="Plain-English explanation" body={plainEnglish(framework)} />
                  <DocsCard title="When to use it" body={whenToUse(framework)} />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <DocsCard
                    title="What Beacon changes technically"
                    body={`Search planning: ${framework.queryHint}`}
                  />
                  <DocsCard
                    title="How the final report changes"
                    body={`Synthesis structure: ${framework.synthesisHint}`}
                  />
                </div>

                <div className="mt-4 border border-white/8 bg-black/25 p-4">
                  <div
                    className="text-[10px] uppercase tracking-[0.18em] text-cyan-300"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Questions this framework helps answer
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {exampleQuestions(framework).map((question) => (
                      <div
                        key={question}
                        className="text-[12px] leading-6 text-[#92a5a8]"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}
                      >
                        {question}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </DocsSection>
        )
      })}
    </DocsShell>
  )
}
