'use client'

import { useState } from 'react'
import { FRAMEWORKS, FRAMEWORKS_BY_ID } from '@/lib/frameworks'

// ── Visual data map ────────────────────────────────────────────────────────

type LayoutType =
  | 'flow'
  | 'diamond'
  | 'grid2x2'
  | 'formula'
  | 'pills'
  | 'columns'
  | 'levels'
  | 'errc'

interface FrameworkVisual {
  layout: LayoutType
  stages: string[]
  colors: string[]
  keyQuestions: string[]
  why: string
}

const FRAMEWORK_VISUALS: Record<string, FrameworkVisual> = {
  'double-diamond': {
    layout: 'diamond',
    stages: ['Discover', 'Define', 'Develop', 'Deliver'],
    colors: ['#00dbe9', '#65f2b5', '#ffb84e', '#9ed8ff'],
    keyQuestions: [
      'What is the full space of possible problems worth solving?',
      'Which specific problem is most worth solving?',
      'What range of solutions might address it?',
      'Which solution delivers the most value?',
    ],
    why: 'Double Diamond ensures the team solves the right problem before designing the right solution, avoiding costly solution-first bias.',
  },
  'jobs-to-be-done': {
    layout: 'flow',
    stages: ['Functional Job', 'Emotional Job', 'Social Job', 'Hiring Trigger'],
    colors: ['#00dbe9', '#65f2b5', '#ffb84e', '#9ed8ff'],
    keyQuestions: [
      'What core task is the user trying to accomplish?',
      'How does the user want to feel while doing it?',
      'How does the user want to be perceived by others?',
      'What event causes the user to seek a solution?',
    ],
    why: 'Jobs to Be Done shifts focus from demographics to motivations, revealing why users truly hire or fire a product.',
  },
  'problem-solution-fit': {
    layout: 'columns',
    stages: ['Problem Frequency', 'Pain Intensity', 'WTP Signal', 'Solution Gap'],
    colors: ['#00dbe9', '#ff6b6b', '#65f2b5', '#ffb84e'],
    keyQuestions: [
      'How often do users encounter this problem?',
      'How painful is the problem when it occurs?',
      'Are users willing to pay to have it solved?',
      'Why do existing solutions fall short?',
    ],
    why: 'Problem/Solution Fit validates that a real, painful, monetizable problem exists before any solution is built.',
  },
  'swot': {
    layout: 'grid2x2',
    stages: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'],
    colors: ['#65f2b5', '#ff6b6b', '#00dbe9', '#ffb84e'],
    keyQuestions: [
      'What internal advantages does the entity hold?',
      'What internal limitations create vulnerability?',
      'What external trends can be leveraged?',
      'What external forces could cause harm?',
    ],
    why: 'SWOT gives a structured four-quadrant view of internal capabilities and external market forces in a single glance.',
  },
  'rice-scoring': {
    layout: 'formula',
    stages: ['Reach', 'Impact', 'Confidence', 'Effort'],
    colors: ['#00dbe9', '#65f2b5', '#ffb84e', '#ff6b6b'],
    keyQuestions: [
      'How many users will this affect in a given period?',
      'How significantly does it move the target metric?',
      'How confident are we in our estimates?',
      'How much work is required to ship it?',
    ],
    why: 'RICE removes gut-feel ranking by converting four evidence signals into a single comparable priority score.',
  },
  'pestle': {
    layout: 'pills',
    stages: ['Political', 'Economic', 'Social', 'Technological', 'Legal', 'Environmental'],
    colors: ['#9ed8ff', '#65f2b5', '#ffb84e', '#00dbe9', '#ff6b6b', '#a8ff78'],
    keyQuestions: [
      'Which macro forces represent the highest near-term risk?',
      'Which forces create hidden opportunities?',
      'How do these forces interact and amplify each other?',
      'What timeline separates near-term from long-term impacts?',
    ],
    why: 'PESTLE surfaces macro-environment forces that product and strategy teams routinely underestimate until they become crises.',
  },
  'blue-ocean': {
    layout: 'errc',
    stages: ['Eliminate', 'Reduce', 'Raise', 'Create'],
    colors: ['#ff6b6b', '#ffb84e', '#65f2b5', '#00dbe9'],
    keyQuestions: [
      'Which industry factors add cost without adding customer value?',
      'Which factors can be reduced well below industry standard?',
      'Which factors should be raised well above industry standard?',
      'Which factors should be created that the industry has never offered?',
    ],
    why: 'Blue Ocean ERRC forces explicit trade-offs that separate market-creating moves from mere competitive iteration.',
  },
  'porters-five-forces': {
    layout: 'flow',
    stages: ['New Entrants', 'Suppliers', 'Rivalry', 'Buyers', 'Substitutes'],
    colors: ['#9ed8ff', '#65f2b5', '#ff6b6b', '#00dbe9', '#ffb84e'],
    keyQuestions: [
      'How easy is it for new competitors to enter this market?',
      'How much bargaining power do suppliers hold?',
      'How intense is rivalry among current competitors?',
      'How much bargaining power do buyers hold?',
      'How likely are customers to switch to substitutes?',
    ],
    why: "Porter's Five Forces explains why some industries are structurally profitable and others are not, regardless of firm-level execution.",
  },
  'empathy-map': {
    layout: 'grid2x2',
    stages: ['Says', 'Thinks', 'Does', 'Feels'],
    colors: ['#00dbe9', '#9ed8ff', '#65f2b5', '#ffb84e'],
    keyQuestions: [
      'What do users verbally express about the experience?',
      'What do users privately believe that they do not say aloud?',
      'What actions and behaviors do users actually exhibit?',
      'What emotions drive and shape the user experience?',
    ],
    why: 'The Empathy Map exposes the gap between what users say and what they actually think, feel, and do.',
  },
  'moscow-method': {
    layout: 'columns',
    stages: ['Must Have', 'Should Have', 'Could Have', "Won't Have"],
    colors: ['#ff6b6b', '#ffb84e', '#65f2b5', '#849495'],
    keyQuestions: [
      'What is non-negotiable for the release to function?',
      'What is important but not critical to the deadline?',
      'What would be nice to include if time allows?',
      'What is explicitly out of scope for this release?',
    ],
    why: 'MoSCoW forces explicit scope decisions, preventing scope creep and aligning stakeholders before work begins.',
  },
  'impact-effort-matrix': {
    layout: 'grid2x2',
    stages: ['Quick Wins', 'Major Projects', 'Fill-Ins', 'Thankless Tasks'],
    colors: ['#65f2b5', '#ffb84e', '#9ed8ff', '#3a4a4c'],
    keyQuestions: [
      'Which initiatives deliver high value for low effort?',
      'Which high-value initiatives require a major investment?',
      'Which low-effort items can fill sprint capacity?',
      'Which items should be deprioritized or eliminated?',
    ],
    why: 'The Impact/Effort Matrix surfaces quick wins hiding in the backlog and protects teams from investing in low-return complexity.',
  },
  'iceberg-model': {
    layout: 'levels',
    stages: ['Events', 'Patterns', 'Structures', 'Mental Models'],
    colors: ['#00dbe9', '#65f2b5', '#ffb84e', '#9ed8ff'],
    keyQuestions: [
      'What observable events are occurring right now?',
      'What recurring trends do the events reveal over time?',
      'Which systems, incentives, or flows create these patterns?',
      'Which beliefs and assumptions sustain the underlying structures?',
    ],
    why: 'The Iceberg Model shows why fixing visible symptoms fails — durable change requires intervening at the structural or mental model level.',
  },
  'opportunity-solution-tree': {
    layout: 'flow',
    stages: ['Desired Outcome', 'Opportunities', 'Solutions', 'Experiments'],
    colors: ['#00dbe9', '#65f2b5', '#ffb84e', '#9ed8ff'],
    keyQuestions: [
      'What outcome metric defines success for the business?',
      'Which unmet needs or pain points block that outcome?',
      'What solutions map to each opportunity?',
      'Which experiments will validate assumptions fastest?',
    ],
    why: 'The Opportunity Solution Tree prevents premature solution framing by keeping the desired outcome — not any specific solution — as the constant anchor.',
  },
  'first-principles': {
    layout: 'levels',
    stages: ['Convention', 'Decompose', 'Constraints', 'Rebuild'],
    colors: ['#ff6b6b', '#ffb84e', '#65f2b5', '#00dbe9'],
    keyQuestions: [
      'What is the industry convention being assumed and not questioned?',
      'What are the actual physical or economic fundamentals governing this?',
      'Which assumptions are conventions versus true immutable constraints?',
      'What would the optimal solution look like built from fundamentals only?',
    ],
    why: 'First Principles Thinking separates conventional wisdom from physical reality, opening solution spaces that analogy-based thinking keeps invisible.',
  },
}

// ── Helper: parse fallback stages from synthesisHint ──────────────────────

function parseSynthesisHintStages(synthesisHint: string): string[] {
  const matches = [...synthesisHint.matchAll(/\((\d+)\)\s+([^;:(]+)/g)]
  if (matches.length === 0) return []
  return matches.map((m) => {
    const raw = m[2].trim()
    // Take only the first em-dash or long word before a dash/colon
    return raw.replace(/\s*[–—-].*$/, '').replace(/\s*:.*$/, '').trim()
  })
}

// ── Layout renderers ────────────────────────────────────────────────────────

function StageBox({
  label,
  color,
  style,
}: {
  label: string
  color: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        backgroundColor: `${color}26`,
        borderLeft: `2px solid ${color}`,
        padding: '4px 8px',
        fontSize: '10px',
        fontFamily: 'var(--font-jetbrains-mono, monospace)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#e5e5e5',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {label}
    </div>
  )
}

function Arrow() {
  return (
    <span
      style={{
        color: '#737373',
        fontSize: '11px',
        fontFamily: 'var(--font-jetbrains-mono, monospace)',
        padding: '0 2px',
        flexShrink: 0,
      }}
    >
      →
    </span>
  )
}

function FlowLayout({ stages, colors }: { stages: string[]; colors: string[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {stages.map((stage, i) => (
        <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <StageBox label={stage} color={colors[i] ?? '#849495'} />
          {i < stages.length - 1 && <Arrow />}
        </div>
      ))}
    </div>
  )
}

function DiamondLayout({ stages, colors }: { stages: string[]; colors: string[] }) {
  // Two pairs: [0,1] and [2,3], separated by |
  const pair1 = stages.slice(0, 2)
  const pair2 = stages.slice(2, 4)
  const col1 = colors.slice(0, 2)
  const col2 = colors.slice(2, 4)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <StageBox label={`◇ ${pair1[0]}`} color={col1[0] ?? '#849495'} />
        <Arrow />
        <StageBox label={`◆ ${pair1[1]}`} color={col1[1] ?? '#849495'} />
      </div>
      <span
        style={{
          color: '#262626',
          fontSize: '14px',
          fontFamily: 'var(--font-jetbrains-mono, monospace)',
          padding: '0 2px',
        }}
      >
        |
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <StageBox label={`◇ ${pair2[0]}`} color={col2[0] ?? '#849495'} />
        <Arrow />
        <StageBox label={`◆ ${pair2[1]}`} color={col2[1] ?? '#849495'} />
      </div>
    </div>
  )
}

function Grid2x2Layout({ stages, colors }: { stages: string[]; colors: string[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px',
        maxWidth: '320px',
      }}
    >
      {stages.map((stage, i) => (
        <StageBox key={stage} label={stage} color={colors[i] ?? '#849495'} />
      ))}
    </div>
  )
}

function FormulaLayout({ stages, colors }: { stages: string[]; colors: string[] }) {
  // R × I × C ÷ E = Priority using actual stage names
  const operators = ['×', '×', '÷', '=']
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {stages.map((stage, i) => (
        <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <StageBox label={stage} color={colors[i] ?? '#849495'} />
          {i < stages.length - 1 && (
            <span
              style={{
                color: '#737373',
                fontSize: '11px',
                fontFamily: 'var(--font-jetbrains-mono, monospace)',
                flexShrink: 0,
              }}
            >
              {operators[i]}
            </span>
          )}
        </div>
      ))}
      <span
        style={{
          color: '#737373',
          fontSize: '11px',
          fontFamily: 'var(--font-jetbrains-mono, monospace)',
          flexShrink: 0,
        }}
      >
        =
      </span>
      <div
        style={{
          backgroundColor: '#ffffff0d',
          borderLeft: '2px solid #737373',
          padding: '4px 8px',
          fontSize: '10px',
          fontFamily: 'var(--font-jetbrains-mono, monospace)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#737373',
          whiteSpace: 'nowrap',
        }}
      >
        Priority
      </div>
    </div>
  )
}

function PillsLayout({ stages, colors }: { stages: string[]; colors: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {stages.map((stage, i) => (
        <span
          key={stage}
          style={{
            backgroundColor: `${colors[i] ?? '#849495'}26`,
            border: `1px solid ${colors[i] ?? '#849495'}66`,
            color: colors[i] ?? '#849495',
            padding: '3px 10px',
            fontSize: '10px',
            fontFamily: 'var(--font-jetbrains-mono, monospace)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'inline-block',
          }}
        >
          {stage}
        </span>
      ))}
    </div>
  )
}

function ColumnsLayout({ stages, colors }: { stages: string[]; colors: string[] }) {
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {stages.map((stage, i) => (
        <div
          key={stage}
          style={{
            backgroundColor: `${colors[i] ?? '#849495'}26`,
            borderTop: `2px solid ${colors[i] ?? '#849495'}`,
            padding: '6px 8px',
            minWidth: '80px',
            maxWidth: '120px',
            fontSize: '10px',
            fontFamily: 'var(--font-jetbrains-mono, monospace)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#e5e5e5',
            textAlign: 'center',
            flex: '1 1 80px',
          }}
        >
          {stage}
        </div>
      ))}
    </div>
  )
}

function LevelsLayout({ stages, colors }: { stages: string[]; colors: string[] }) {
  const total = stages.length
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
      {stages.map((stage, i) => {
        // Top = widest (100%), bottom = narrowest (70%)
        const widthPct = 100 - i * (30 / Math.max(total - 1, 1))
        // Opacity increases with depth
        const opacity = 0.12 + i * (0.18 / Math.max(total - 1, 1))
        const color = colors[i] ?? '#849495'
        return (
          <div
            key={stage}
            style={{
              width: `${widthPct}%`,
              backgroundColor: `${color}`,
              opacity: opacity + 0.5, // keep background visible
              borderLeft: `3px solid ${color}`,
              padding: '4px 10px',
              fontSize: '10px',
              fontFamily: 'var(--font-jetbrains-mono, monospace)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#e5e5e5',
            }}
            // Use a wrapper to prevent opacity from affecting text
          >
            <span style={{ opacity: 1 / (opacity + 0.5) }}>{stage}</span>
          </div>
        )
      })}
    </div>
  )
}

function ErrcLayout({ stages, colors }: { stages: string[]; colors: string[] }) {
  // 2x2: Eliminate top-left, Reduce top-right, Raise bottom-left, Create bottom-right
  const order = [0, 1, 2, 3] // already correct order from data
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px',
        maxWidth: '320px',
      }}
    >
      {order.map((idx) => (
        <StageBox key={stages[idx]} label={stages[idx]} color={colors[idx] ?? '#849495'} />
      ))}
    </div>
  )
}

function VisualDiagram({
  layout,
  stages,
  colors,
}: {
  layout: LayoutType
  stages: string[]
  colors: string[]
}) {
  switch (layout) {
    case 'flow':
      return <FlowLayout stages={stages} colors={colors} />
    case 'diamond':
      return <DiamondLayout stages={stages} colors={colors} />
    case 'grid2x2':
      return <Grid2x2Layout stages={stages} colors={colors} />
    case 'formula':
      return <FormulaLayout stages={stages} colors={colors} />
    case 'pills':
      return <PillsLayout stages={stages} colors={colors} />
    case 'columns':
      return <ColumnsLayout stages={stages} colors={colors} />
    case 'levels':
      return <LevelsLayout stages={stages} colors={colors} />
    case 'errc':
      return <ErrcLayout stages={stages} colors={colors} />
    default:
      return <FlowLayout stages={stages} colors={colors} />
  }
}

// ── Main component ─────────────────────────────────────────────────────────

export default function FrameworkBanner({ frameworkId }: { frameworkId?: string }) {
  const [open, setOpen] = useState(false)

  if (!frameworkId) return null

  const framework = FRAMEWORKS_BY_ID.get(frameworkId)
  if (!framework) return null

  // Resolve visual data
  let visual = FRAMEWORK_VISUALS[frameworkId]

  if (!visual) {
    // Fallback: parse synthesisHint for numbered stages
    const parsedStages = parseSynthesisHintStages(framework.synthesisHint)
    const stages = parsedStages.length > 0 ? parsedStages.slice(0, 6) : [framework.name]
    visual = {
      layout: 'flow',
      stages,
      colors: stages.map(() => '#849495'),
      keyQuestions: [],
      why: framework.description,
    }
  }

  const accentColor = visual.colors[0] ?? '#849495'

  return (
    <div
      style={{
        backgroundColor: '#111111',
        border: '1px solid #262626',
        borderLeft: `2px solid ${accentColor}4d`,
        marginBottom: '16px',
      }}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Framework name badge */}
          <span
            style={{
              backgroundColor: `${accentColor}1a`,
              border: `1px solid ${accentColor}4d`,
              color: accentColor,
              padding: '2px 8px',
              fontSize: '10px',
              fontFamily: 'var(--font-jetbrains-mono, monospace)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'inline-block',
            }}
          >
            {framework.name}
          </span>
          {/* "Research Method" label */}
          <span
            style={{
              color: '#737373',
              fontSize: '11px',
              fontFamily: 'var(--font-space-grotesk, var(--font-jetbrains-mono, monospace))',
            }}
          >
            Research Method
          </span>
        </div>
        {/* Toggle */}
        <span
          style={{
            color: '#737373',
            fontSize: '10px',
            fontFamily: 'var(--font-jetbrains-mono, monospace)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          {open ? '▲ Hide model' : '▼ See model'}
        </span>
      </button>

      {/* Expandable body */}
      {open && (
        <div
          style={{
            padding: '0 12px 12px 12px',
            borderTop: '1px solid #262626',
          }}
        >
          {/* Visual diagram */}
          <div style={{ paddingTop: '12px', paddingBottom: '12px' }}>
            <VisualDiagram
              layout={visual.layout}
              stages={visual.stages}
              colors={visual.colors}
            />
          </div>

          {/* Key questions + why */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: visual.keyQuestions.length > 0 ? '1fr auto' : '1fr',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            {/* Key questions */}
            {visual.keyQuestions.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-jetbrains-mono, monospace)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#737373',
                    marginBottom: '6px',
                  }}
                >
                  Key Questions
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {visual.keyQuestions.map((q) => (
                    <li
                      key={q}
                      style={{
                        display: 'flex',
                        gap: '6px',
                        fontSize: '11px',
                        color: '#9db0b3',
                        fontFamily:
                          'var(--font-space-grotesk, var(--font-jetbrains-mono, monospace))',
                        lineHeight: '1.5',
                        marginBottom: '3px',
                      }}
                    >
                      <span
                        style={{
                          color: accentColor,
                          flexShrink: 0,
                          opacity: 0.7,
                        }}
                      >
                        ›
                      </span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Why this framework */}
            <div
              style={{
                borderLeft: '1px solid #262626',
                paddingLeft: '12px',
                minWidth: '0',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-jetbrains-mono, monospace)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#737373',
                  marginBottom: '6px',
                }}
              >
                Why this method
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '11px',
                  color: '#9db0b3',
                  fontFamily:
                    'var(--font-space-grotesk, var(--font-jetbrains-mono, monospace))',
                  lineHeight: '1.5',
                }}
              >
                {visual.why}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
