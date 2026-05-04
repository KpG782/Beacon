'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Brain,
  Compass,
  Filter,
  FlaskConical,
  ListOrdered,
  Network,
  Search,
  Users,
  Wrench,
} from 'lucide-react'
import {
  CodeBlock,
  DOCS_NAV,
  DocsCard,
  DocsSection,
  DocsShell,
} from '@/components/docs/docs-shell'
import {
  FRAMEWORK_CATEGORIES,
  FRAMEWORKS,
  type FrameworkCategory,
  type FrameworkOption,
} from '@/lib/frameworks'

const CATEGORY_GUIDE: Record<
  FrameworkCategory,
  { layman: string; technical: string; useCase: string }
> = {
  'Discovery & Framing': {
    layman:
      'Use these when the team is still trying to define the actual problem before building.',
    technical:
      'Biases planning toward root cause, unmet needs, constraints, and problem clarity.',
    useCase:
      'Best for early-stage validation and scope framing.',
  },
  'User Research': {
    layman:
      'Use these when you need to understand user behavior, motivation, and friction.',
    technical:
      'Pushes evidence gathering toward user voice, journeys, and behavioral patterns.',
    useCase:
      'Best for UX, onboarding, and product discovery.',
  },
  Prioritization: {
    layman:
      'Use these when you have too many options and need a clear rank order.',
    technical:
      'Transforms synthesis into scoring, tradeoffs, and decision ordering.',
    useCase:
      'Best for roadmap and scope decisions.',
  },
  'Systems Thinking': {
    layman:
      'Use these when the issue is systemic and not solved by one feature tweak.',
    technical:
      'Emphasizes loops, dependencies, incentives, and second-order effects.',
    useCase:
      'Best for ecosystem and organizational complexity.',
  },
  Strategy: {
    layman:
      'Use these when positioning, competition, and durable advantage matter.',
    technical:
      'Shifts analysis toward market structure and strategic leverage.',
    useCase:
      'Best for GTM and competitive analysis.',
  },
  Validation: {
    layman:
      'Use these when you need to test quickly before major investment.',
    technical:
      'Focuses output on experiments, proof signals, and falsifiable assumptions.',
    useCase:
      'Best for MVP and pre-build risk reduction.',
  },
  'AI/Deep Research': {
    layman:
      'Use these when ambiguity is high and you need stronger reasoning depth.',
    technical:
      'Changes reasoning shape: decomposition, critique, scenario analysis, adversarial checks.',
    useCase:
      'Best for strategic uncertainty and nuanced questions.',
  },
}

const CATEGORY_META: Record<
  FrameworkCategory,
  { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }
> = {
  'Discovery & Framing': { icon: Compass, color: '#00dbe9' },
  'User Research': { icon: Users, color: '#65f2b5' },
  Prioritization: { icon: ListOrdered, color: '#ffb84e' },
  'Systems Thinking': { icon: Network, color: '#9ed8ff' },
  Strategy: { icon: Compass, color: '#c084fc' },
  Validation: { icon: FlaskConical, color: '#7de9ff' },
  'AI/Deep Research': { icon: Brain, color: '#f29bff' },
}

function titleCaseSentence(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function plainEnglish(framework: FrameworkOption): string {
  const description = framework.description.endsWith('.')
    ? framework.description.slice(0, -1)
    : framework.description
  return `In plain English: ${titleCaseSentence(description)}.`
}

function whenToUse(framework: FrameworkOption): string {
  return `Use ${framework.name} when your research decision depends on ${framework.category.toLowerCase()} behavior rather than a generic summary.`
}

function exampleQuestions(framework: FrameworkOption): string[] {
  return [
    `What decision becomes easier after applying ${framework.name}?`,
    `What evidence should be weighted highest under this lens?`,
    `What would this framework likely deprioritize?`,
  ]
}

function categorySectionId(category: FrameworkCategory): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export default function DocsFrameworksPage() {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | FrameworkCategory>('all')

  const filteredFrameworks = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FRAMEWORKS.filter((framework) => {
      if (selectedCategory !== 'all' && framework.category !== selectedCategory) return false
      if (!q) return true
      return (
        framework.name.toLowerCase().includes(q) ||
        framework.id.toLowerCase().includes(q) ||
        framework.description.toLowerCase().includes(q) ||
        framework.queryHint.toLowerCase().includes(q) ||
        framework.synthesisHint.toLowerCase().includes(q)
      )
    })
  }, [query, selectedCategory])

  const grouped = useMemo(() => {
    return FRAMEWORK_CATEGORIES.map((category) => ({
      category,
      frameworks: filteredFrameworks.filter((framework) => framework.category === category),
    })).filter((group) => group.frameworks.length > 0)
  }, [filteredFrameworks])

  const tocItems = useMemo(
    () => [
      { id: 'developer-quick-start', label: 'Quick Start' },
      { id: 'framework-finder', label: 'Framework Finder' },
      ...grouped.map((group) => ({
        id: categorySectionId(group.category),
        label: group.category,
      })),
    ],
    [grouped]
  )

  return (
    <DocsShell
      eyebrow="Framework Guide"
      title="Developer-friendly framework docs with quick filtering and deep links."
      description="Find frameworks quickly, jump to the exact section, and expand implementation details only when you need them."
      navItems={DOCS_NAV}
      tocItems={tocItems}
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
      <DocsSection id="developer-quick-start" eyebrow="Quick Start" title="How to use frameworks without scrolling forever">
        <div className="grid gap-3 md:grid-cols-3">
          <DocsCard title="1. Filter first" body="Use category chips + keyword search to narrow down quickly." />
          <DocsCard title="2. Pick by decision" body="Choose based on the decision you need to make, not the framework name." />
          <DocsCard title="3. Expand only details" body="Open the implementation panel only for the frameworks you plan to run." />
        </div>
        <CodeBlock>{`Suggested developer workflow:
1. Set category (or keep All)
2. Type keyword (e.g. "diamond", "risk", "persona", "market")
3. Open matched framework card
4. Use queryHint + synthesisHint in your run setup`}</CodeBlock>
      </DocsSection>

      <DocsSection id="framework-finder" eyebrow="Finder" title="Find the right framework fast">
        <div className="border border-white/8 bg-black/20 p-4">
          <div className="relative mb-3">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#849495]">
              <Search size={14} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search frameworks, IDs, behavior, setup hints..."
              className="w-full border border-white/10 bg-black/35 py-2.5 pl-9 pr-3 text-[12px] text-[#e5e2e3] outline-none placeholder:text-[#556467] focus:border-cyan-400/35"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            />
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                selectedCategory === 'all'
                  ? 'border-cyan-400/40 bg-cyan-400/12 text-cyan-300'
                  : 'border-white/10 text-[#9db0b3] hover:border-cyan-400/25'
              }`}
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="mr-1 inline-block align-middle">
                <Filter size={12} />
              </span>
              All
            </button>
            {FRAMEWORK_CATEGORIES.map((category) => {
              const meta = CATEGORY_META[category]
              const Icon = meta.icon
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                    selectedCategory === category
                      ? 'bg-black/35 text-[#eef3f4]'
                      : 'border-white/10 text-[#9db0b3] hover:border-cyan-400/25'
                  }`}
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                    borderColor: selectedCategory === category ? meta.color : undefined,
                  }}
                >
                  <span className="mr-1 inline-block align-middle">
                    <Icon size={12} />
                  </span>
                  {category}
                </button>
              )
            })}
          </div>
          <div className="text-[11px] text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Showing {filteredFrameworks.length} framework{filteredFrameworks.length === 1 ? '' : 's'}.
          </div>
        </div>
      </DocsSection>

      {grouped.map(({ category, frameworks }) => {
        const intro = CATEGORY_GUIDE[category]
        const meta = CATEGORY_META[category]
        const Icon = meta.icon

        return (
          <DocsSection
            key={category}
            id={categorySectionId(category)}
            eyebrow="Category"
            title={category}
          >
            <div className="border border-white/8 bg-black/20 p-4">
              <div className="mb-3 flex items-center gap-2" style={{ color: meta.color }}>
                <Icon size={16} />
                <span className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Category setup
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <DocsCard title="Plain-language read" body={intro.layman} />
                <DocsCard title="Technical effect" body={intro.technical} />
                <DocsCard title="Best use case" body={intro.useCase} />
              </div>
            </div>

            <div className="grid gap-3">
              {frameworks.map((framework) => (
                <article key={framework.id} id={`fw-${framework.id}`} className="border border-white/8 bg-black/20 p-4 scroll-mt-28">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-[16px] text-[#eef3f4]">{framework.name}</div>
                    <span
                      className="border px-2 py-1 text-[10px] uppercase tracking-[0.16em]"
                      style={{
                        borderColor: `${meta.color}66`,
                        color: meta.color,
                        fontFamily: 'var(--font-space-grotesk)',
                      }}
                    >
                      {framework.id}
                    </span>
                  </div>

                  <p className="mt-2 text-[12px] leading-6 text-[#c8d5d8]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {framework.description}
                  </p>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <DocsCard title="Plain-English explanation" body={plainEnglish(framework)} />
                    <DocsCard title="When to use it" body={whenToUse(framework)} />
                  </div>

                  <div className="mt-3 border border-white/8 bg-black/25 p-3">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Setup flow
                    </div>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="border border-white/8 bg-black/30 px-3 py-2 text-[11px] text-[#d3dcde]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        1. Brief + objective
                      </div>
                      <div className="border border-white/8 bg-black/30 px-3 py-2 text-[11px] text-[#d3dcde]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        2. Query plan bias
                      </div>
                      <div className="border border-white/8 bg-black/30 px-3 py-2 text-[11px] text-[#d3dcde]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        3. Synthesis structure
                      </div>
                    </div>
                  </div>

                  <details className="mt-3 border border-white/8 bg-black/25">
                    <summary className="cursor-pointer list-none px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-cyan-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      <span className="inline-flex items-center gap-2">
                        <Wrench size={12} />
                        Developer implementation details
                      </span>
                    </summary>
                    <div className="border-t border-white/8 p-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <DocsCard
                          title="Search planning hint"
                          body={framework.queryHint}
                        />
                        <DocsCard
                          title="Report synthesis hint"
                          body={framework.synthesisHint}
                        />
                      </div>
                      <div className="mt-3 border border-white/8 bg-black/30 p-3">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          Questions this framework helps answer
                        </div>
                        <div className="mt-2 grid gap-1">
                          {exampleQuestions(framework).map((question) => (
                            <div key={question} className="text-[11px] text-[#a8b8bb]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                              • {question}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                </article>
              ))}
            </div>
          </DocsSection>
        )
      })}
    </DocsShell>
  )
}
