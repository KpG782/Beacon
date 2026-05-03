'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ResearchGraphScene, { type GraphSceneLink, type GraphSceneNode } from '@/components/graph/research-graph-scene'

interface Source {
  url: string
  title?: string
  snippet?: string
  index?: number
}

interface TrialStatus {
  runId: string
  status: 'running' | 'sleeping' | 'complete' | 'failed'
  topic: string
  report?: string
  sources?: Source[]
  runCount?: number
  error?: string
  deltaUrls?: string[]
  queryPlan?: {
    queries: Array<{
      q: string
      engine: string
      intent: string
    }>
  }
}

function truncate(text: string, max = 72) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

function buildTrialGraph(detail: TrialStatus | null): {
  nodes: GraphSceneNode[]
  links: GraphSceneLink[]
} {
  if (!detail) return { nodes: [], links: [] }

  const deltaSet = new Set(detail.deltaUrls ?? [])
  const nodes: GraphSceneNode[] = [
    {
      id: 'topic',
      label: truncate(detail.topic, 44),
      sublabel: `Run #${detail.runCount ?? 1}`,
      kind: 'topic',
      color: '#00dbe9',
      size: 16,
      detail: detail.topic,
      meta: [
        `status: ${detail.status}`,
        `sources: ${detail.sources?.length ?? 0}`,
        `new sources: ${deltaSet.size}`,
      ],
    },
    {
      id: 'report',
      label: detail.status === 'complete' ? 'sample brief ready' : detail.status,
      sublabel: `${detail.report?.length ?? 0} chars`,
      kind: 'report',
      color: '#ffd694',
      size: 9,
      detail: detail.report ?? 'No report text available.',
      meta: [
        `mode: ${deltaSet.size > 0 ? 'delta-capable' : 'baseline'}`,
        `run id: ${detail.runId}`,
      ],
    },
  ]

  const links: GraphSceneLink[] = [{ from: 'report', to: 'topic', color: '#ffd694' }]

  ;(detail.queryPlan?.queries ?? []).slice(0, 8).forEach((query, index) => {
    const id = `query-${index}`
    nodes.push({
      id,
      label: truncate(query.q, 24),
      sublabel: query.engine,
      kind: 'query',
      color: '#ffb84e',
      size: 6,
      detail: query.q,
      meta: [`intent: ${query.intent ?? 'search'}`],
    })
    links.push({ from: id, to: 'topic', color: '#4b3612' })
  })

  ;(detail.sources ?? []).slice(0, 14).forEach((source, index) => {
    const id = `source-${index}`
    const isNew = deltaSet.has(source.url)
    nodes.push({
      id,
      label: truncate(source.title || hostLabel(source.url), 24),
      sublabel: isNew ? 'NEW SOURCE' : hostLabel(source.url),
      kind: 'source',
      color: isNew ? '#00dbe9' : '#9ed8ff',
      size: isNew ? 8.5 : 6.5,
      detail: source.snippet ?? source.url,
      url: source.url,
      meta: [
        `host: ${hostLabel(source.url)}`,
        isNew ? 'new this run' : 'indexed source',
      ],
    })
    links.push({ from: id, to: 'topic', color: isNew ? '#1a4a54' : '#2a5968' })
  })

  return { nodes, links }
}

function buildLoadingGraph(detail: TrialStatus | null): {
  nodes: GraphSceneNode[]
  links: GraphSceneLink[]
} {
  const topic = detail?.topic ?? 'Beacon sample brief'
  return {
    nodes: [
      {
        id: 'topic',
        label: truncate(topic, 36),
        sublabel: 'beacon core',
        kind: 'topic',
        color: '#00dbe9',
        size: 16,
        detail: 'Beacon is assembling the topic core and preparing the research mesh.',
        meta: ['topic accepted', 'workflow active', 'memory scope isolated'],
      },
      {
        id: 'memory',
        label: 'memory shell',
        sublabel: 'trial state',
        kind: 'memory',
        color: '#65f2b5',
        size: 9,
        detail: 'This session keeps its own private trial memory for reruns and deltas.',
        meta: ['session-scoped', 'no shared user data'],
      },
      {
        id: 'report',
        label: 'report synth',
        sublabel: 'writing',
        kind: 'report',
        color: '#ffd694',
        size: 9,
        detail: 'The synthesis model will compress findings into the final sample brief.',
        meta: ['citations pending', 'summary forming'],
      },
      {
        id: 'query-0',
        label: 'plan queries',
        sublabel: 'scout model',
        kind: 'query',
        color: '#ffb84e',
        size: 6,
        detail: 'Beacon is generating search angles based on your selected framework and objective.',
      },
      {
        id: 'query-1',
        label: 'shape framework',
        sublabel: 'prompt lens',
        kind: 'query',
        color: '#ffb84e',
        size: 6,
        detail: 'Framework guidance is steering both retrieval and report structure.',
      },
      {
        id: 'source-0',
        label: 'source node',
        sublabel: 'web signal',
        kind: 'source',
        color: '#9ed8ff',
        size: 7,
        detail: 'Candidate source nodes light up as the mesh starts collecting evidence.',
      },
      {
        id: 'source-1',
        label: 'neural link',
        sublabel: 'source mesh',
        kind: 'source',
        color: '#00dbe9',
        size: 8,
        detail: 'Live signal links represent search traffic flowing into the topic core.',
      },
    ],
    links: [
      { from: 'report', to: 'topic', color: '#ffd694' },
      { from: 'memory', to: 'topic', color: '#65f2b5' },
      { from: 'query-0', to: 'topic', color: '#4b3612' },
      { from: 'query-1', to: 'topic', color: '#4b3612' },
      { from: 'source-0', to: 'topic', color: '#2a5968' },
      { from: 'source-1', to: 'topic', color: '#1a4a54' },
    ],
  }
}

export default function TrialRunPage() {
  const params = useParams<{ id: string }>()
  const runId = typeof params.id === 'string' ? params.id : ''
  const [data, setData] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('topic')

  useEffect(() => {
    if (!runId) return

    let active = true
    const load = async () => {
      try {
        const res = await fetch(`/api/trial/${runId}`, { cache: 'no-store' })
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'Trial run not found.' }))
          throw new Error(body.error ?? 'Trial run not found.')
        }

        const next = await res.json()
        if (!active) return
        setData(next)
        setError('')
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to load trial run.')
        setLoading(false)
      }
    }

    load()
    const id = window.setInterval(load, 5000)
    return () => {
      active = false
      window.clearInterval(id)
    }
  }, [runId])

  const newSourceCount = useMemo(() => new Set(data?.deltaUrls ?? []).size, [data?.deltaUrls])
  const graph = useMemo(() => buildTrialGraph(data), [data])
  const loadingGraph = useMemo(() => buildLoadingGraph(data), [data])
  const selectedNode = useMemo(
    () => graph.nodes.find((node) => node.id === selectedNodeId) ?? graph.nodes[0] ?? null,
    [graph.nodes, selectedNodeId]
  )
  const selectedLoadingNode = useMemo(
    () => loadingGraph.nodes.find((node) => node.id === selectedNodeId) ?? loadingGraph.nodes[0] ?? null,
    [loadingGraph.nodes, selectedNodeId]
  )

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0d10] px-6 py-8 text-[#e5e5e5]">
      <div className="absolute inset-0 pointer-events-none landing-noise opacity-35" />
      <div className="absolute inset-x-0 top-0 h-[26rem] pointer-events-none neural-backdrop opacity-70" />
      <div className="mx-auto max-w-5xl">
        <div className="relative mb-6 flex items-center justify-between gap-4">
          <Link
            href="/trial"
            className="text-[11px] uppercase tracking-[0.2em] text-[#9db0b3] transition-colors hover:text-cyan-300"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Back to trial setup
          </Link>
          <Link
            href="/sign-up"
            className="border border-cyan-400/25 bg-cyan-400/8 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-cyan-200 transition-colors hover:bg-cyan-400/14"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Create account
          </Link>
        </div>

        {loading ? (
          <div className="relative border border-white/8 bg-black/25 p-8 text-center text-[#b3c9cc]">Loading trial run…</div>
        ) : error ? (
          <div className="relative border border-red-500/30 bg-red-500/10 p-6 text-red-200">{error}</div>
        ) : data?.status === 'running' || data?.status === 'sleeping' ? (
          <div className="relative flex flex-col gap-6">
            <section className="border border-white/8 bg-black/25 p-6 backdrop-blur-sm sm:p-8">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div
                    className="mb-3 text-[10px] uppercase tracking-[0.22em] text-cyan-300"
                    style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                  >
                    Trial Running
                  </div>
                  <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#fafafa]">
                    Building your sample brief.
                  </h1>
                  <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#c5c5c5]">
                    Beacon is planning searches, collecting source nodes, and drafting the report for <span className="text-[#fafafa]">{data.topic}</span>.
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center border border-cyan-400/20 bg-cyan-400/8 text-cyan-300">
                  <span className="material-symbols-outlined text-[30px]">adjust</span>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="border border-white/8 bg-[#050608]">
                  <ResearchGraphScene
                    nodes={loadingGraph.nodes}
                    links={loadingGraph.links}
                    selectedNodeId={selectedLoadingNode?.id ?? null}
                    onSelect={(node) => setSelectedNodeId(node.id)}
                  />
                </div>
                <div className="border border-white/8 bg-[#091117] p-4">
                  <div
                    className="mb-2 text-[10px] uppercase tracking-[0.18em] text-cyan-300"
                    style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                  >
                    Live Node Detail
                  </div>
                  {selectedLoadingNode ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-[15px] font-semibold text-[#f5f5f5]">{selectedLoadingNode.label}</div>
                        <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-cyan-300">
                          {selectedLoadingNode.sublabel}
                        </div>
                      </div>
                      <p className="text-[12px] leading-6 text-[#c5c5c5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {selectedLoadingNode.detail}
                      </p>
                      <div className="space-y-2">
                        {(selectedLoadingNode.meta ?? []).map((item) => (
                          <div
                            key={item}
                            className="border border-white/8 bg-black/20 px-3 py-2 text-[11px] text-[#b3c9cc]"
                            style={{ fontFamily: 'var(--font-space-grotesk)' }}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[12px] text-[#737373]">Loading neural mesh…</div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  'Neural links animate while sources are being collected.',
                  'Framework prompt bias is already shaping the research path.',
                  'This page refreshes automatically until the report is complete.',
                ].map((item) => (
                  <div
                    key={item}
                    className="border border-white/8 bg-[#091117] px-4 py-3 text-[12px] leading-6 text-[#bcd0d4]"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : data?.status === 'failed' ? (
          <div className="relative border border-white/8 bg-black/25 p-8">
            <h1 className="text-2xl font-semibold text-[#fafafa]">The sample brief failed.</h1>
            <p className="mt-3 text-[14px] text-[#d4d4d4]">{data.error ?? 'Unknown workflow error.'}</p>
          </div>
        ) : (
          <div className="relative flex flex-col gap-6">
            <section className="border border-white/8 bg-black/25 p-6 backdrop-blur-sm sm:p-8">
              <div
                className="mb-3 text-[10px] uppercase tracking-[0.22em] text-cyan-300"
                style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              >
                Trial Report
              </div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#fafafa]">{data?.topic}</h1>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                <span className="border border-white/8 bg-[#091117] px-3 py-1 text-[#eff8fa]">Run #{data?.runCount ?? 1}</span>
                <span className="border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-cyan-200">{newSourceCount > 0 ? `+${newSourceCount} new sources` : 'baseline brief'}</span>
              </div>

              <div className="markdown-report mt-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{data?.report ?? ''}</ReactMarkdown>
              </div>
            </section>

            <section className="border border-white/8 bg-black/25 p-6 backdrop-blur-sm">
              <div
                className="mb-4 text-[10px] uppercase tracking-[0.22em] text-cyan-300"
                style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              >
                Research Graph
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="border border-white/8 bg-[#050608]">
                  <ResearchGraphScene
                    nodes={graph.nodes}
                    links={graph.links}
                    selectedNodeId={selectedNode?.id ?? null}
                    onSelect={(node) => setSelectedNodeId(node.id)}
                  />
                </div>
                <div className="border border-white/8 bg-[#091117] p-4">
                  <div
                    className="mb-2 text-[10px] uppercase tracking-[0.18em] text-cyan-300"
                    style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                  >
                    Node Detail
                  </div>
                  {selectedNode ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-[15px] font-semibold text-[#f5f5f5]">{selectedNode.label}</div>
                        {selectedNode.sublabel && (
                          <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-cyan-300">
                            {selectedNode.sublabel}
                          </div>
                        )}
                      </div>
                      <p className="text-[12px] leading-6 text-[#c5c5c5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {selectedNode.detail}
                      </p>
                      {(selectedNode.meta ?? []).length > 0 && (
                        <div className="space-y-2">
                          {(selectedNode.meta ?? []).map((item) => (
                            <div
                              key={item}
                              className="border border-white/8 bg-black/20 px-3 py-2 text-[11px] text-[#b3c9cc]"
                              style={{ fontFamily: 'var(--font-space-grotesk)' }}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[12px] text-[#737373]">No graph nodes available yet.</div>
                  )}
                </div>
              </div>
            </section>

            <section className="border border-white/8 bg-black/25 p-6 backdrop-blur-sm">
              <div
                className="mb-4 text-[10px] uppercase tracking-[0.22em] text-cyan-300"
                style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              >
                Sources
              </div>
              <div className="flex flex-col gap-3">
                {(data?.sources ?? []).map((source, index) => (
                  <a
                    key={`${source.url}-${index}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-white/8 bg-[#091117] p-4 transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/[0.03]"
                  >
                    <div className="text-[13px] font-semibold text-[#f5f5f5]">{source.title || source.url}</div>
                    {source.snippet && (
                      <p className="mt-2 text-[12px] leading-6 text-[#b3b3b3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {source.snippet}
                      </p>
                    )}
                    <div className="mt-2 text-[11px] text-[#737373]" style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                      {source.url}
                    </div>
                  </a>
                ))}
              </div>
            </section>

            <section className="border border-cyan-400/18 bg-cyan-400/[0.05] p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[16px] text-[#fafafa]">Liked the result?</div>
                  <p className="mt-1 text-[13px] leading-6 text-[#b3b3b3]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Create an account to keep private memory by user, manage your own keys, and continue in the full dashboard.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/trial"
                    className="border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#e7f2f4] transition-colors hover:bg-white/5"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Run another trial
                  </Link>
                  <Link
                    href="/sign-up"
                    className="bg-cyan-400 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#002022] transition-colors hover:bg-cyan-300"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Create account
                  </Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
