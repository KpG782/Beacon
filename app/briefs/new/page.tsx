'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FRAMEWORKS, FRAMEWORK_CATEGORIES, type FrameworkOption } from '@/lib/frameworks'

const SOURCES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'slack', label: 'Slack' },
  { value: 'github', label: 'GitHub' },
  { value: 'discord', label: 'Discord' },
]

const DEPTH_OPTIONS = [
  { value: 'quick', label: 'Quick Scan', meta: 'Faster, narrower' },
  { value: 'deep', label: 'Deep Dive', meta: 'Broader, more complete' },
]

const TIMEFRAME_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
] as const

const REPORT_STYLE_OPTIONS = [
  { value: 'executive', label: 'Executive Brief' },
  { value: 'bullet', label: 'Bullet Summary' },
  { value: 'memo', label: 'Analyst Memo' },
  { value: 'framework', label: 'Framework Report' },
] as const

const PRESETS = [
  {
    label: 'Hackathon Validation',
    topic: 'Validate a hackathon idea: AI-powered expense categorization for freelancers',
    objective: 'Determine whether the problem is real, who already complains about it, what alternatives exist, and whether there is a market signal strong enough to build now.',
    focus: 'problem evidence, user pain signals, existing solutions and gaps, market timing, recent launches',
    timeframe: '90d' as const,
    reportStyle: 'framework' as const,
    frameworkId: 'problem-solution-fit',
  },
  {
    label: 'Competitor Scan',
    topic: 'AI coding agents',
    objective: 'Compare the strongest products, pricing, positioning, and product tradeoffs.',
    focus: 'key players, pricing, differentiators, launches, enterprise traction',
    timeframe: '30d' as const,
    reportStyle: 'executive' as const,
    frameworkId: '',
  },
  {
    label: 'Weekly Tracker',
    topic: 'OpenAI developer ecosystem',
    objective: 'Track the most important changes since the last run.',
    focus: 'model launches, pricing changes, SDK updates, API features',
    timeframe: '7d' as const,
    reportStyle: 'bullet' as const,
    frameworkId: '',
  },
]

const OBJECTIVE_SUGGESTIONS = [
  'Find what changed recently',
  'Compare competitors',
  'Track pricing and launches',
  'Surface risks and opportunities',
]

const FOCUS_SUGGESTIONS = [
  'pricing',
  'product launches',
  'enterprise adoption',
  'developer sentiment',
]

const DRAFT_KEY = 'beacon:brief:draft'

interface MemoryPreview {
  topic: string
  runCount: number
  urlsIndexed: number
  factsStored: number
  lastRunAt: string
  reportSummary: string
}

function FrameworkRow({
  fw,
  selected,
  onSelect,
}: {
  fw: FrameworkOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
        selected ? 'bg-cyan-400/5 border-l-2 border-cyan-400' : 'border-l-2 border-transparent'
      }`}
    >
      <span className={`w-2 h-2 rounded-full border shrink-0 mt-1 flex items-center justify-center ${
        selected ? 'border-cyan-400 bg-cyan-400' : 'border-white/20 bg-transparent'
      }`}>
        {selected && <span className="w-1 h-1 rounded-full bg-black block" />}
      </span>
      <div className="min-w-0">
        <p className={`text-[12px] font-semibold ${selected ? 'text-cyan-400' : 'text-[#e5e2e3]'}`}
           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          {fw.name}
        </p>
        <p className="text-[10px] text-[#849495] line-clamp-2"
           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          {fw.description}
        </p>
      </div>
    </button>
  )
}

function ChoiceChip({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 text-[11px] border transition-colors ${
        active
          ? 'border-cyan-400/50 bg-cyan-400/10 text-[#e5e2e3]'
          : 'border-white/10 text-[#849495] hover:border-white/20 hover:text-[#e5e2e3]'
      }`}
      style={{ fontFamily: 'var(--font-space-grotesk)' }}
    >
      {children}
    </button>
  )
}

export default function NewBriefPage() {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [objective, setObjective] = useState('')
  const [focus, setFocus] = useState('')
  const [source, setSource] = useState('dashboard')
  const [depth, setDepth] = useState<'quick' | 'deep'>('deep')
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [reportStyle, setReportStyle] = useState<'executive' | 'bullet' | 'memo' | 'framework'>('executive')
  const [recurring, setRecurring] = useState(false)
  const [frameworkId, setFrameworkId] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [fwOpen, setFwOpen] = useState(false)
  const [fwSearch, setFwSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [memory, setMemory] = useState<MemoryPreview | null | 'checking'>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [keysReady, setKeysReady] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/profile/keys')
      .then(r => r.json())
      .then((data: { groq?: { set: boolean }; serp?: { set: boolean } }) => {
        setKeysReady(!!(data.groq?.set && data.serp?.set))
      })
      .catch(() => setKeysReady(false))
  }, [])

  const selectedFramework: FrameworkOption | null = frameworkId
    ? (FRAMEWORKS.find((f) => f.id === frameworkId) ?? null)
    : null

  const filteredFrameworks = fwSearch.trim()
    ? FRAMEWORKS.filter((f) =>
        f.name.toLowerCase().includes(fwSearch.toLowerCase()) ||
        f.description.toLowerCase().includes(fwSearch.toLowerCase())
      )
    : null

  useEffect(() => {
    const saved = window.localStorage.getItem(DRAFT_KEY)
    if (saved) {
      try {
        const d = JSON.parse(saved) as {
          topic?: string
          objective?: string
          focus?: string
          source?: string
          recurring?: boolean
          depth?: 'quick' | 'deep'
          timeframe?: '7d' | '30d' | '90d' | 'all'
          reportStyle?: 'executive' | 'bullet' | 'memo' | 'framework'
          frameworkId?: string
        }
        if (d.topic) setTopic(d.topic)
        if (d.objective) setObjective(d.objective)
        if (d.focus) setFocus(d.focus)
        if (d.source) setSource(d.source)
        if (typeof d.recurring === 'boolean') setRecurring(d.recurring)
        if (d.depth) setDepth(d.depth)
        if (d.timeframe) setTimeframe(d.timeframe)
        if (d.reportStyle) setReportStyle(d.reportStyle)
        if (d.frameworkId) setFrameworkId(d.frameworkId)
      } catch {}
    }
    const t = new URLSearchParams(window.location.search).get('topic')
    if (t) setTopic(decodeURIComponent(t))
  }, [])

  useEffect(() => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({
      topic,
      objective,
      focus,
      source,
      recurring,
      depth,
      timeframe,
      reportStyle,
      frameworkId,
    }))
  }, [topic, objective, focus, source, recurring, depth, timeframe, reportStyle, frameworkId])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!topic.trim() || topic.trim().length < 4) { setMemory(null); return }
    setMemory('checking')
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/memory/check?topic=${encodeURIComponent(topic.trim())}`)
        setMemory(await res.json())
      } catch {
        setMemory(null)
      }
    }, 600)
  }, [topic])

  function applyPreset(preset: typeof PRESETS[number]) {
    setTopic(preset.topic)
    setObjective(preset.objective)
    setFocus(preset.focus)
    setTimeframe(preset.timeframe)
    setReportStyle(preset.reportStyle)
    if (preset.frameworkId) setFrameworkId(preset.frameworkId)
  }

  function appendSuggestion(current: string, value: string) {
    if (!current.trim()) return value
    if (current.toLowerCase().includes(value.toLowerCase())) return current
    return `${current}, ${value}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) { setError('Topic is required.'); return }
    setError('')
    setLoading(true)

    try {
      let userKeys: Record<string, string> | undefined
      try {
        const stored = window.localStorage.getItem('beacon:user:keys')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.groqApiKey || parsed.serpApiKey) userKeys = parsed
        }
      } catch {}

      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          objective: objective.trim() || undefined,
          focus: focus.trim() || undefined,
          source,
          recurring,
          depth,
          timeframe,
          reportStyle,
          frameworkId: frameworkId ?? undefined,
          userKeys,
        }),
      })
      if (!res.ok) {
        let msg = 'Failed to start research.'
        try {
          const errBody = await res.json()
          msg = errBody?.error ?? msg
        } catch {
          msg = (await res.text()) || msg
        }
        throw new Error(msg)
      }
      const { runId } = await res.json()
      window.localStorage.removeItem(DRAFT_KEY)
      router.push(`/briefs/${runId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start research.')
      setLoading(false)
    }
  }

  const hasMemory = memory !== null && memory !== 'checking' && typeof memory === 'object'
  const mem = hasMemory ? (memory as MemoryPreview) : null
  const queryEstimate = depth === 'quick' ? '5-7 queries' : '8-10 queries'
  const eta = depth === 'quick' ? '~45s' : '~90s'
  const timeframeLabel = TIMEFRAME_OPTIONS.find((o) => o.value === timeframe)?.label ?? timeframe
  const reportStyleLabel = REPORT_STYLE_OPTIONS.find((o) => o.value === reportStyle)?.label ?? reportStyle
  const primaryObjective = objective.trim() || 'General research brief'
  const primaryFocus = focus.trim() || 'Broad coverage'

  if (keysReady === false) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center gap-6 max-w-lg mx-auto text-center">
        <div className="w-14 h-14 border border-orange-500/30 bg-orange-500/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-orange-400 text-[32px]">key_off</span>
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-[#e5e5e5] mb-2"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            API Keys Required
          </h2>
          <p className="text-[13px] text-[#737373] leading-relaxed"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Beacon needs your Groq and SerpAPI keys before it can run research. Keys are encrypted and stored securely — they never leave your account.
          </p>
        </div>
        <Link
          href="/profile"
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-bold tracking-widest uppercase transition-colors"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Add API Keys →
        </Link>
        <Link href="/dashboard" className="text-[11px] text-[#737373] hover:text-[#e5e5e5] transition-colors">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-2 text-[12px] text-[#849495]"
             style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
          <span className="text-[#3b494b]">/</span>
          <span className="text-[#e5e2e3]">Deploy Research Agent</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          <div className="flex flex-col gap-5 min-w-0">
            <div className="border border-[#262626] bg-[#111111] px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-col gap-3">
                <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#f97316]"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Guided Setup
                </div>
                <h1 className="text-[26px] sm:text-[32px] leading-tight text-[#e5e5e5]">
                  Tell Beacon what to research.
                </h1>
                <p className="max-w-3xl text-[13px] sm:text-[14px] text-[#737373]"
                   style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Start with the topic and goal. Everything else can stay automatic unless you want to tune it.
                </p>
              </div>
            </div>

            <div className="border border-[#262626] bg-[#111111] px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 border border-[#262626] flex items-center justify-center text-[11px] text-[#f97316] shrink-0"
                     style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                  01
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-[#e5e5e5] mb-1">What should Beacon research?</div>
                  <p className="text-[12px] text-[#737373] mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Be specific enough to narrow the space, but you do not need to write the full plan yourself.
                  </p>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. AI browser agents in 2026"
                    rows={3}
                    autoFocus
                    className="w-full bg-[#0a0a0a] text-[#e5e5e5] text-[14px] px-4 py-4 border border-[#262626] outline-none placeholder:text-[#4a4a4a] focus:border-[#f97316] transition-colors resize-none"
                    style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.6 }}
                  />
                  <div className="flex gap-2 flex-wrap mt-3">
                    {PRESETS.map((preset) => (
                      <ChoiceChip key={preset.label} onClick={() => applyPreset(preset)}>
                        {preset.label}
                      </ChoiceChip>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#262626] bg-[#111111] px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 border border-[#262626] flex items-center justify-center text-[11px] text-[#f97316] shrink-0"
                     style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                  02
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                  <div>
                    <div className="text-[14px] font-semibold text-[#e5e5e5] mb-1">What do you want to learn?</div>
                    <p className="text-[12px] text-[#737373]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      This helps Beacon decide which queries and synthesis angle matter most.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#737373]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Objective
                    </label>
                    <textarea
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      placeholder="e.g. Compare the strongest products and identify gaps in the market."
                      rows={3}
                      className="w-full bg-[#0a0a0a] text-[#e5e5e5] text-[13px] px-4 py-3 border border-[#262626] outline-none placeholder:text-[#4a4a4a] focus:border-[#f97316] transition-colors resize-none"
                      style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.6 }}
                    />
                    <div className="flex gap-2 flex-wrap">
                      {OBJECTIVE_SUGGESTIONS.map((item) => (
                        <ChoiceChip key={item} onClick={() => setObjective(item)}>
                          {item}
                        </ChoiceChip>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#737373]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Priority Focus
                    </label>
                    <textarea
                      value={focus}
                      onChange={(e) => setFocus(e.target.value)}
                      placeholder="e.g. pricing, launches, developer sentiment, enterprise traction"
                      rows={3}
                      className="w-full bg-[#0a0a0a] text-[#e5e5e5] text-[13px] px-4 py-3 border border-[#262626] outline-none placeholder:text-[#4a4a4a] focus:border-[#f97316] transition-colors resize-none"
                      style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.6 }}
                    />
                    <div className="flex gap-2 flex-wrap">
                      {FOCUS_SUGGESTIONS.map((item) => (
                        <ChoiceChip key={item} onClick={() => setFocus((prev) => appendSuggestion(prev, item))}>
                          {item}
                        </ChoiceChip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#262626] bg-[#111111] px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 border border-[#262626] flex items-center justify-center text-[11px] text-[#f97316] shrink-0"
                     style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                  03
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                  <div>
                    <div className="text-[14px] font-semibold text-[#e5e5e5] mb-1">Quick scope</div>
                    <p className="text-[12px] text-[#737373]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      These are the only knobs most people need before deploying.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#737373]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Time Scope
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {TIMEFRAME_OPTIONS.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            active={timeframe === opt.value}
                            onClick={() => setTimeframe(opt.value)}
                          >
                            {opt.label}
                          </ChoiceChip>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#737373]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Depth
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {DEPTH_OPTIONS.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            active={depth === opt.value}
                            onClick={() => setDepth(opt.value as 'quick' | 'deep')}
                          >
                            {opt.label}
                          </ChoiceChip>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#737373]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Output
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {REPORT_STYLE_OPTIONS.map((opt) => (
                          <ChoiceChip
                            key={opt.value}
                            active={reportStyle === opt.value}
                            onClick={() => setReportStyle(opt.value)}
                          >
                            {opt.label}
                          </ChoiceChip>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#262626] bg-[#0a0a0a] px-4 py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[12px] font-semibold text-[#e5e5e5]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Recurring run
                      </div>
                      <div className="text-[11px] text-[#737373]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Sleep for 7 days, then rerun as a delta workflow.
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={recurring}
                      onClick={() => setRecurring((r) => !r)}
                      className="cursor-pointer shrink-0 relative w-11 h-6 rounded-full transition-colors"
                      style={{
                        background: recurring ? 'rgba(249,115,22,0.24)' : 'rgba(255,255,255,0.08)',
                        border: `1px solid ${recurring ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      <span
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                        style={{ transform: recurring ? 'translateX(20px)' : 'translateX(1px)' }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#262626] bg-[#111111] overflow-hidden">
              <button
                type="button"
                onClick={() => setAdvancedOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 sm:px-6 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="text-[12px] font-semibold text-[#e5e5e5]"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Advanced settings
                  </div>
                  <div className="text-[11px] text-[#737373]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Framework, delivery channel, and deeper control.
                  </div>
                </div>
                <span className="text-[11px] text-[#f97316]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {advancedOpen ? 'Hide' : 'Show'}
                </span>
              </button>

              {advancedOpen && (
                <div className="border-t border-[#262626] px-5 py-5 sm:px-6 flex flex-col gap-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#737373]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Delivery Channel
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {SOURCES.map((s) => (
                          <ChoiceChip
                            key={s.value}
                            active={source === s.value}
                            onClick={() => setSource(s.value)}
                          >
                            {s.label}
                          </ChoiceChip>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#737373]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Framework
                      </div>
                      <button
                        type="button"
                        onClick={() => setFwOpen((o) => !o)}
                        className="border border-[#262626] bg-[#0a0a0a] px-4 py-3 text-left hover:border-[#f97316] transition-colors"
                      >
                        <div className="text-[12px] text-[#e5e5e5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {selectedFramework ? selectedFramework.name : 'No framework selected'}
                        </div>
                        <div className="text-[10px] text-[#737373]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {selectedFramework ? selectedFramework.description : 'Use Beacon without a formal research lens.'}
                        </div>
                      </button>
                    </div>
                  </div>

                  {fwOpen && (
                    <div className="border border-[#262626] bg-[#0a0a0a]">
                      <div className="px-4 py-3 border-b border-[#262626]">
                        <input
                          type="text"
                          value={fwSearch}
                          onChange={(e) => setFwSearch(e.target.value)}
                          placeholder="Filter frameworks..."
                          className="w-full bg-[#111111] text-[#e5e5e5] text-[12px] px-3 py-2 border border-[#262626] outline-none placeholder:text-[#4a4a4a] focus:border-[#f97316] transition-colors"
                          style={{ fontFamily: 'var(--font-space-grotesk)' }}
                        />
                      </div>
                      <div className="overflow-y-auto max-h-[320px] py-1.5">
                        {!fwSearch.trim() && (
                          <button
                            type="button"
                            onClick={() => { setFrameworkId(null); setFwOpen(false) }}
                            className={`w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-white/5 ${
                              frameworkId === null ? 'bg-white/5' : ''
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full border shrink-0 flex items-center justify-center ${
                              frameworkId === null ? 'border-cyan-400 bg-cyan-400' : 'border-white/20 bg-transparent'
                            }`}>
                              {frameworkId === null && <span className="w-1 h-1 rounded-full bg-black block" />}
                            </span>
                            <div>
                              <p className="text-[12px] text-[#e5e5e5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                No framework
                              </p>
                              <p className="text-[10px] text-[#737373]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                General-purpose research report
                              </p>
                            </div>
                          </button>
                        )}

                        {filteredFrameworks && filteredFrameworks.length === 0 && (
                          <p className="px-4 py-4 text-[11px] text-[#737373]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            No frameworks match &ldquo;{fwSearch}&rdquo;
                          </p>
                        )}

                        {filteredFrameworks && filteredFrameworks.map((fw) => (
                          <FrameworkRow
                            key={fw.id}
                            fw={fw}
                            selected={frameworkId === fw.id}
                            onSelect={() => { setFrameworkId(fw.id); setFwSearch(''); setFwOpen(false) }}
                          />
                        ))}

                        {!filteredFrameworks && FRAMEWORK_CATEGORIES.map((cat) => (
                          <div key={cat}>
                            <p className="px-4 pt-3 pb-1 text-[9px] font-bold tracking-[0.18em] uppercase text-[#4a4a4a]"
                               style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                              {cat}
                            </p>
                            {FRAMEWORKS.filter((f) => f.category === cat).map((fw) => (
                              <FrameworkRow
                                key={fw.id}
                                fw={fw}
                                selected={frameworkId === fw.id}
                                onSelect={() => { setFrameworkId(fw.id); setFwOpen(false) }}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="xl:sticky xl:top-24 flex flex-col gap-4">
            <div className="border border-[#262626] bg-[#111111] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#f97316]"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Run Preview
                  </div>
                  <div className="text-[12px] text-[#737373] mt-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Beacon will use this setup if you deploy now.
                  </div>
                </div>

                <div className="border border-[#262626] bg-[#0a0a0a] px-4 py-4">
                  <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#737373] mb-2"
                       style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Topic
                  </div>
                  <div className="text-[14px] text-[#e5e5e5] leading-relaxed" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {topic.trim() || 'Waiting for topic'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Mode', value: hasMemory ? 'Delta' : 'Baseline' },
                    { label: 'ETA', value: eta },
                    { label: 'Queries', value: queryEstimate },
                    { label: 'Scope', value: timeframeLabel },
                  ].map((item) => (
                    <div key={item.label} className="border border-[#262626] bg-[#0a0a0a] px-3 py-3">
                      <div className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#737373] mb-1"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {item.label}
                      </div>
                      <div className="text-[12px] text-[#e5e5e5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border border-[#262626] bg-[#0a0a0a] px-4 py-4 flex flex-col gap-2">
                  <div>
                    <div className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#737373] mb-1"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Objective
                    </div>
                    <div className="text-[12px] text-[#e5e5e5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {primaryObjective}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#737373] mb-1"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Focus
                    </div>
                    <div className="text-[12px] text-[#e5e5e5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {primaryFocus}
                    </div>
                  </div>
                  <div className="pt-1 text-[11px] text-[#737373]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {reportStyleLabel} · {recurring ? 'Recurring weekly' : 'One-time run'}
                    {selectedFramework ? ` · ${selectedFramework.name}` : ''}
                  </div>
                </div>

                <div className="border border-[#262626] bg-[#0a0a0a] px-4 py-4 min-h-[112px]">
                  {memory === 'checking' && (
                    <div className="flex items-center gap-2 text-[11px] text-[#737373]"
                         style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      <svg className="w-3.5 h-3.5 animate-spin text-[#737373]" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="10" />
                      </svg>
                      Checking memory bank...
                    </div>
                  )}

                  {!topic.trim() && memory === null && (
                    <div className="text-[11px] text-[#737373]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Enter a topic to check whether Beacon already knows this area.
                    </div>
                  )}

                  {topic.trim() && memory === null && (
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#737373]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        First Run
                      </div>
                      <div className="text-[12px] text-[#e5e5e5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        No prior memory found. Beacon will build a baseline report and initial source ledger.
                      </div>
                    </div>
                  )}

                  {mem && (
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#f97316]"
                           style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Existing Memory Found
                      </div>
                      <div className="text-[12px] text-[#e5e5e5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {mem.runCount} prior runs · {mem.urlsIndexed} URLs · {mem.factsStored} facts
                      </div>
                      <div className="text-[11px] text-[#737373]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Last researched {new Date(mem.lastRunAt).toLocaleDateString()}. This run will focus on deltas.
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="text-[11px] text-[#ffb4ab]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="w-full min-h-[52px] border border-[#f97316] bg-[#f97316] text-[#0a0a0a] text-[12px] font-bold tracking-[0.18em] uppercase transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {loading ? 'Initializing...' : hasMemory ? 'Deploy Delta Agent' : 'Deploy Research Agent'}
                </button>

                <div className="text-[10px] text-[#4a4a4a] leading-relaxed"
                     style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Durable workflow · survives restarts · MCP-ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
