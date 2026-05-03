'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FRAMEWORKS, type FrameworkOption } from '@/lib/frameworks'

const PRESETS = [
  {
    label: 'AI Agents',
    topic: 'AI agent platform pricing and launches in 2026',
    objective: 'Find the strongest products, pricing moves, and recent launches.',
    focus: 'pricing, launches, enterprise traction',
  },
  {
    label: 'OpenAI Ecosystem',
    topic: 'OpenAI developer ecosystem updates',
    objective: 'Summarize the most important recent changes for builders.',
    focus: 'models, SDKs, API updates, pricing',
  },
  {
    label: 'Browser Agents',
    topic: 'AI browser agents market landscape',
    objective: 'Map the category and identify which products stand out.',
    focus: 'products, positioning, use cases, risks',
  },
]

export default function TrialPage() {
  const router = useRouter()
  const [topic, setTopic] = useState(PRESETS[0].topic)
  const [objective, setObjective] = useState(PRESETS[0].objective)
  const [focus, setFocus] = useState(PRESETS[0].focus)
  const [frameworkId, setFrameworkId] = useState<string>(FRAMEWORKS[0]?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedFramework = FRAMEWORKS.find((framework) => framework.id === frameworkId) ?? null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) {
      setError('Topic is required.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          objective: objective.trim() || undefined,
          focus: focus.trim() || undefined,
          frameworkId: frameworkId || undefined,
          depth: 'quick',
          timeframe: '30d',
          reportStyle: frameworkId ? 'framework' : 'executive',
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to start trial.' }))
        throw new Error(body.error ?? 'Failed to start trial.')
      }

      const { runId } = await res.json()
      router.push(`/trial/${runId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start trial.')
      setLoading(false)
    }
  }

  function applyPreset(index: number) {
    const preset = PRESETS[index]
    setTopic(preset.topic)
    setObjective(preset.objective)
    setFocus(preset.focus)
  }

  function chooseFramework(framework: FrameworkOption) {
    setFrameworkId(framework.id)
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0d10] text-[#e5e2e3]">
      <div className="absolute inset-0 pointer-events-none landing-noise opacity-35" />
      <div className="absolute inset-x-0 top-0 h-[28rem] pointer-events-none neural-backdrop opacity-75" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.2em] text-[#9db0b3] transition-colors hover:text-cyan-300"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Back to landing
          </Link>
          <Link
            href="/sign-up"
            className="border border-cyan-400/25 bg-cyan-400/8 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-cyan-200 transition-colors hover:bg-cyan-400/14"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Create account
          </Link>
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
          <div>
            <div
              className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/8 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-cyan-300"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <span className="h-2 w-2 bg-cyan-400 animate-pulse" />
              Sample brief sandbox
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.94] tracking-[-0.04em] text-[#f4f7f8] md:text-6xl">
              Start research fast.
            </h1>
            <p
              className="mt-5 max-w-3xl text-[16px] leading-8 text-[#9db0b3]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Pick a topic, set the angle, choose a framework, and let Beacon run the sample brief. The goal here is less setup, more research.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {[
              ['3 runs', 'Try a few different research angles.'],
              ['Quick scan', 'Fast output with real citations.'],
              ['Private', 'Trial data stays in this session.'],
            ].map(([title, body]) => (
              <div key={title} className="border border-white/8 bg-black/25 p-4">
                <div className="text-[18px] text-[#f3f7f8]">{title}</div>
                <p
                  className="mt-2 text-[12px] leading-6 text-[#8ea1a5]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="border border-white/8 bg-black/25 backdrop-blur-sm">
            <div className="border-b border-white/8 px-5 py-4 sm:px-6">
              <div
                className="text-[10px] uppercase tracking-[0.22em] text-cyan-300"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Research Setup
              </div>
              <h2 className="mt-2 text-[22px] tracking-[-0.03em] text-[#f4f7f8]">
                Tell Beacon what to research.
              </h2>
            </div>

            <div className="flex flex-col gap-6 px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset, index) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(index)}
                    className="border border-cyan-400/15 bg-cyan-400/6 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-[#d4e8eb] transition-colors hover:border-cyan-400/35 hover:bg-cyan-400/12 hover:text-cyan-200"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Topic
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  className="w-full resize-none border border-white/10 bg-[#071016] px-4 py-4 text-[15px] text-[#f5fbfc] outline-none transition-colors placeholder:text-[#5f767b] focus:border-cyan-400/50"
                  style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.6 }}
                />
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Goal
                  </label>
                  <textarea
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    rows={4}
                    className="w-full resize-none border border-white/10 bg-[#071016] px-4 py-3 text-[13px] text-[#f5fbfc] outline-none transition-colors placeholder:text-[#5f767b] focus:border-cyan-400/50"
                    style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.6 }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Focus
                  </label>
                  <textarea
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    rows={4}
                    className="w-full resize-none border border-white/10 bg-[#071016] px-4 py-3 text-[13px] text-[#f5fbfc] outline-none transition-colors placeholder:text-[#5f767b] focus:border-cyan-400/50"
                    style={{ fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.6 }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div
                      className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      Framework
                    </div>
                    <p
                      className="mt-2 text-[13px] leading-6 text-[#9db0b3]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      Choose the lens Beacon should use for planning and synthesis.
                    </p>
                  </div>
                  {selectedFramework && (
                    <div className="text-[11px] uppercase tracking-[0.16em] text-cyan-200" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {selectedFramework.name}
                    </div>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {FRAMEWORKS.slice(0, 9).map((framework) => {
                    const active = framework.id === frameworkId
                    return (
                      <button
                        key={framework.id}
                        type="button"
                        onClick={() => chooseFramework(framework)}
                        className={`border p-4 text-left transition-colors ${
                          active
                            ? 'border-cyan-400/45 bg-cyan-400/10'
                            : 'border-white/8 bg-[#091117] hover:border-cyan-400/20 hover:bg-cyan-400/4'
                        }`}
                      >
                        <div
                          className="text-[10px] uppercase tracking-[0.18em] text-cyan-300"
                          style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                        >
                          {framework.category}
                        </div>
                        <div className="mt-2 text-[14px] font-semibold text-[#f5fbfc]">{framework.name}</div>
                        <p
                          className="mt-2 text-[12px] leading-6 text-[#a7bcc0]"
                          style={{ fontFamily: 'var(--font-space-grotesk)' }}
                        >
                          {framework.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {error && (
                <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4 border border-cyan-400/18 bg-cyan-400/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-[#eff8fa]">Quick depth, 30-day scope, real citations.</div>
                  <div
                    className="mt-2 text-[12px] leading-6 text-[#9db0b3]"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    The trial is optimized to get people into research quickly, not to make them configure the whole product first.
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-400 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#002022] transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {loading ? 'Starting trial…' : 'Run sample brief'}
                </button>
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <div className="border border-white/8 bg-black/25 p-5 backdrop-blur-sm">
              <div
                className="text-[10px] uppercase tracking-[0.22em] text-cyan-300"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Current setup
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ['Topic', topic || 'Not set'],
                  ['Goal', objective || 'General research brief'],
                  ['Focus', focus || 'Broad coverage'],
                  ['Framework', selectedFramework?.name ?? 'None'],
                ].map(([label, value]) => (
                  <div key={label} className="border border-white/8 bg-[#091117] px-4 py-3">
                    <div
                      className="text-[10px] uppercase tracking-[0.16em] text-cyan-300"
                      style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                    >
                      {label}
                    </div>
                    <div
                      className="mt-2 text-[12px] leading-6 text-[#d9e6e8]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/8 bg-black/25 p-5 backdrop-blur-sm">
              <div
                className="text-[10px] uppercase tracking-[0.22em] text-cyan-300"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                What happens next
              </div>
              <div
                className="mt-4 space-y-3 text-[13px] leading-6 text-[#9db0b3]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <p>Beacon plans the search path, builds the source mesh, writes the sample brief, and shows the graph while it runs.</p>
                <p>Create an account after the trial if you want private long-term memory, saved keys, and the full dashboard.</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}
