'use client'

import { useEffect, useMemo, useState } from 'react'
import ResearchGraphScene, { type GraphSceneLink, type GraphSceneNode } from '@/components/graph/research-graph-scene'

interface BriefListRecord {
  runId: string
  topic: string
  status: 'running' | 'sleeping' | 'complete' | 'failed'
  source: string
  recurring: boolean
  runCount: number
  createdAt: string
  updatedAt?: string
}

interface SourceRecord {
  title?: string
  url: string
  snippet?: string
  index?: number
  engine?: string
}

interface QueryEntry {
  q: string
  engine: string
  intent: string
}

interface BriefDetail extends BriefListRecord {
  report?: string
  sources?: SourceRecord[]
  hasMemory?: boolean
  memoryFacts?: number
  deltaUrls?: string[]
  queryPlan?: { queries: QueryEntry[] }
}

interface MemoryEntry {
  topic: string
  runCount: number
  lastRunAt: string
  seenUrls: string[]
  keyFacts: string[]
  reportSummary: string
  _key: string
}

type GraphSource = {
  url: string
  title?: string
  snippet?: string
  engine?: string
}

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

function truncate(text: string, max = 84): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function buildGraphNodes(
  detail: BriefDetail | null,
  memory: MemoryEntry | null
): {
  nodes: GraphSceneNode[]
  links: GraphSceneLink[]
} {
  if (!detail && !memory) return { nodes: [], links: [] }

  const deltaSet = new Set(detail?.deltaUrls ?? [])

  const sourceNodes: GraphSource[] = (
    detail?.sources
    ?? memory?.seenUrls.map((url) => ({
      url,
      title: hostLabel(url),
      engine: 'memory url',
    }))
    ?? []
  ).slice(0, 14)

  // All key facts for memory node detail
  const allFacts = memory?.keyFacts ?? []
  const factLines = allFacts.length
    ? allFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')
    : 'No key facts extracted yet.'

  const nodes: GraphSceneNode[] = [
    {
      id: 'topic',
      label: truncate(detail?.topic ?? memory?.topic ?? 'Unknown topic', 44),
      sublabel: `Run #${detail?.runCount ?? memory?.runCount ?? 1}`,
      kind: 'topic',
      color: '#00dbe9',
      size: 16,
      detail: detail?.topic ?? memory?.topic ?? 'Unknown topic',
      meta: [
        `status: ${detail?.status ?? 'memory-only'}`,
        `sources: ${detail?.sources?.length ?? memory?.seenUrls.length ?? 0}`,
        `facts: ${detail?.memoryFacts ?? memory?.keyFacts.length ?? 0}`,
        `new sources this run: ${deltaSet.size}`,
      ],
    },
    {
      id: 'report',
      label: detail ? (detail.status === 'complete' ? 'report ready' : detail.status) : 'memory summary',
      sublabel: detail?.report
        ? `${detail.report.length} chars`
        : memory?.reportSummary
          ? `${memory.reportSummary.length} chars`
          : 'workflow output',
      kind: 'report',
      color: '#ffd694',
      size: 9,
      detail: detail?.report ?? memory?.reportSummary ?? 'No report text available.',
      meta: [
        `source: ${detail?.source ?? 'memory'}`,
        `chars: ${detail?.report?.length ?? memory?.reportSummary.length ?? 0}`,
        `recurring: ${detail?.recurring ? 'yes' : 'no'}`,
      ],
    },
    {
      id: 'memory',
      label: detail?.hasMemory ?? memory ? 'memory linked' : 'fresh memory',
      sublabel: `${detail?.memoryFacts ?? memory?.keyFacts.length ?? 0} facts · ${memory?.seenUrls.length ?? 0} URLs`,
      kind: 'memory',
      color: '#65f2b5',
      size: 9,
      detail: factLines,
      meta: [
        `run count: ${memory?.runCount ?? detail?.runCount ?? 0}`,
        `last run: ${memory?.lastRunAt ? new Date(memory.lastRunAt).toLocaleDateString() : 'unknown'}`,
        `urls indexed: ${memory?.seenUrls.length ?? detail?.sources?.length ?? 0}`,
        `facts extracted: ${allFacts.length}`,
      ],
    },
  ]

  const links: GraphSceneLink[] = [
    { from: 'report', to: 'topic', color: '#ffd694' },
    { from: 'memory', to: 'topic', color: '#65f2b5' },
  ]

  // Query plan nodes — one node per query, linked to topic
  const queries = detail?.queryPlan?.queries ?? []
  queries.slice(0, 8).forEach((q, index) => {
    const id = `query-${index}`
    nodes.push({
      id,
      label: truncate(q.q, 26),
      sublabel: q.engine,
      kind: 'query' as GraphSceneNode['kind'],
      color: '#ffb84e',
      size: 6,
      detail: q.q,
      meta: [
        `engine: ${q.engine}`,
        `intent: ${q.intent ?? 'search'}`,
        `query #${index + 1}`,
      ],
    })
    links.push({ from: id, to: 'topic', color: '#3d2e0a' })
  })

  // Source nodes — color new (delta) vs known differently
  sourceNodes.forEach((source, index) => {
    const id = `source-${index}`
    const isNew = deltaSet.has(source.url)

    nodes.push({
      id,
      label: truncate(source.title || hostLabel(source.url), 22),
      sublabel: isNew ? `NEW · ${source.engine ?? 'source'}` : source.engine ?? 'source',
      kind: 'source',
      color: isNew ? '#00dbe9' : '#9ed8ff',
      size: isNew ? 8.5 : 6.5,
      detail: source.snippet ?? source.url,
      url: source.url,
      meta: [
        `host: ${hostLabel(source.url)}`,
        `engine: ${source.engine ?? 'unknown'}`,
        isNew ? 'new this run' : 'previously indexed',
        source.title ? `title: ${truncate(source.title, 52)}` : 'title: unavailable',
      ],
    })

    links.push({ from: id, to: 'topic', color: isNew ? '#1a4a54' : '#2a5968' })
  })

  return { nodes, links }
}

export default function GraphPage() {
  const [briefs, setBriefs] = useState<BriefListRecord[]>([])
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BriefDetail | null>(null)
  const [memory, setMemory] = useState<MemoryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [topicParam, setTopicParam] = useState<string | null>(null)
  const [runIdParam, setRunIdParam] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('topic')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setTopicParam(params.get('topic'))
    setRunIdParam(params.get('runId'))
  }, [])

  useEffect(() => {
    async function loadBriefs() {
      try {
        const [briefRes, memoryRes] = await Promise.all([
          fetch('/api/briefs'),
          fetch('/api/memory'),
        ])
        const data: BriefListRecord[] = briefRes.ok ? await briefRes.json() : []
        setBriefs(data)
        const memories: MemoryEntry[] = memoryRes.ok ? await memoryRes.json() : []
        const matchedMemory = topicParam
          ? memories.find((entry) => entry.topic === topicParam) ?? null
          : null
        setMemory(matchedMemory)

        const byRunId = runIdParam
          ? data.find((item) => item.runId === runIdParam)
          : null
        const byTopic = topicParam
          ? data.find((item) => item.topic === topicParam && item.status === 'complete')
            ?? data.find((item) => item.topic === topicParam)
          : null
        const preferred =
          byRunId
          ?? byTopic
          ?? data.find((item) => item.status === 'complete')
          ?? data[0]
          ?? null
        if (preferred) setSelectedRunId(preferred.runId)
      } finally {
        setLoading(false)
      }
    }
    loadBriefs()
  }, [runIdParam, topicParam])

  useEffect(() => {
    if (!selectedRunId) return
    async function loadDetail() {
      setLoadingDetail(true)
      try {
        const res = await fetch(`/api/briefs/${selectedRunId}`)
        if (!res.ok) return
        const data: BriefDetail = await res.json()
        setDetail(data)
      } finally {
        setLoadingDetail(false)
      }
    }
    loadDetail()
  }, [selectedRunId])

  const graph = useMemo(() => buildGraphNodes(detail, memory), [detail, memory])
  const selectedNode = useMemo(
    () => graph.nodes.find((node) => node.id === selectedNodeId) ?? graph.nodes[0] ?? null,
    [graph.nodes, selectedNodeId]
  )

  useEffect(() => {
    setSelectedNodeId('topic')
  }, [detail?.topic, memory?.topic])

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-8">
        <div className="border border-cyan-400/15 bg-cyan-400/[0.04] p-5 sm:p-6 lg:p-8">
          <div
            className="text-[11px] uppercase tracking-[0.24em] text-cyan-300 mb-3"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Research Graph
          </div>
          <h1 className="max-w-5xl text-3xl tracking-[-0.04em] text-[#f3f7f8] sm:text-4xl md:text-5xl">
            Turn one Beacon run into a second-brain neural mesh.
          </h1>
          <p
            className="mt-4 max-w-3xl text-[13px] leading-6 text-[#9fb0b3] sm:text-[14px] sm:leading-7 md:text-[15px]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            This page visualizes the current topic, report state, memory state, and every source URL captured in a run
            as linked nodes. Use it to inspect how one research run becomes reusable graph-shaped knowledge.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.32fr)_minmax(0,0.68fr)] xl:gap-6">
          <div className="flex flex-col gap-4">
            <div className="border border-white/8 bg-white/[0.02] p-4">
              <div
                className="text-[10px] uppercase tracking-[0.22em] text-[#8ea1a5] mb-3"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Select Run
              </div>
              {loading ? (
                <div className="text-[12px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Loading runs...
                </div>
              ) : briefs.length === 0 ? (
                <div className="text-[12px] text-[#849495]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  No runs yet. Start a research brief first.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {topicParam && (
                    <div
                      className="border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-2 text-[11px] text-cyan-300"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      Focused on topic: {truncate(topicParam, 44)}
                    </div>
                  )}
                  {briefs.slice(0, 12).map((brief) => {
                    const active = brief.runId === selectedRunId
                    return (
                      <button
                        key={brief.runId}
                        onClick={() => {
                          setSelectedRunId(brief.runId)
                          setSelectedNodeId('topic')
                        }}
                        className={`border p-3 text-left transition-colors min-h-[72px] ${
                          active
                            ? 'border-cyan-400/35 bg-cyan-400/8'
                            : 'border-white/8 bg-black/20 hover:border-white/14'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div
                            className="text-[10px] uppercase tracking-[0.2em]"
                            style={{ fontFamily: 'var(--font-space-grotesk)', color: active ? '#67efff' : '#8ea1a5' }}
                          >
                            {brief.status}
                          </div>
                          <div className="text-[10px] text-[#667b7f]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            #{brief.runCount}
                          </div>
                        </div>
                        <div className="text-[13px] leading-6 text-[#e8eff0]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {truncate(brief.topic, 70)}
                        </div>
                        <div className="text-[10px] text-[#6f8286] mt-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {brief.source} • {new Date(brief.updatedAt ?? brief.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                ['Topic node',    detail?.topic ?? memory?.topic ?? '—'],
                ['Source nodes',  String(detail?.sources?.length ?? memory?.seenUrls.length ?? 0)],
                ['New this run',  String(detail?.deltaUrls?.length ?? 0)],
                ['Query nodes',   String(detail?.queryPlan?.queries.length ?? 0)],
                ['Memory facts',  String(detail?.memoryFacts ?? memory?.keyFacts.length ?? 0)],
              ].map(([title, value]) => (
                <div key={title} className="border border-white/8 bg-black/20 p-4">
                  <div
                    className="text-[10px] uppercase tracking-[0.2em] text-[#8ea1a5] mb-2"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    {title}
                  </div>
                  <div className="text-[16px] leading-6 text-[#eef3f4]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {truncate(value, 48)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="border border-white/8 bg-[#07090c] p-3 sm:p-4 lg:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <div
                    className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-1"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Neural Link Visualization
                  </div>
                  <div className="text-[15px] text-[#eef3f4] sm:text-[16px] lg:text-[18px]">
                    {detail?.topic
                      ? truncate(detail.topic, 96)
                      : memory?.topic
                        ? truncate(memory.topic, 96)
                        : 'No run selected'}
                  </div>
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.18em] text-[#8ea1a5] sm:text-[11px] sm:tracking-[0.2em]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  URLs become second-brain nodes
                </div>
              </div>

              <ResearchGraphScene
                nodes={graph.nodes}
                links={graph.links}
                selectedNodeId={selectedNode?.id ?? null}
                onSelect={(node) => setSelectedNodeId(node.id)}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="border border-white/8 bg-white/[0.02] p-5">
                <div
                  className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-3"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Selected Node
                </div>
                {selectedNode ? (
                  <div className="flex flex-col gap-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    <div>
                      <div className="text-[16px] leading-6 text-[#eef3f4]">{selectedNode.label}</div>
                      <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: selectedNode.color }}>
                        {selectedNode.kind} • {selectedNode.sublabel}
                      </div>
                    </div>

                    {selectedNode.meta && selectedNode.meta.length > 0 && (
                      <div className="grid gap-2">
                        {selectedNode.meta.map((item) => (
                          <div key={item} className="border border-white/8 bg-black/20 px-3 py-2 text-[11px] leading-5 text-[#b7c7ca]">
                            {item}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="border border-white/8 bg-black/20 p-3 text-[12px] leading-6 text-[#a0b1b4]">
                      {selectedNode.detail ?? 'No additional detail available.'}
                    </div>

                    {selectedNode.url && (
                      <a
                        href={selectedNode.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-fit items-center gap-2 border border-cyan-400/20 bg-cyan-400/8 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-cyan-300 hover:bg-cyan-400/12 transition-colors"
                      >
                        Open source
                        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-[12px] leading-6 text-[#a0b1b4] sm:text-[13px] sm:leading-7" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {loadingDetail ? 'Loading run detail...' : 'This run does not have a completed report yet.'}
                  </p>
                )}
              </div>

              <div className="border border-white/8 bg-white/[0.02] p-5">
                <div
                  className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 mb-3"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  How to read this
                </div>
                <div className="flex flex-col gap-2 text-[12px] leading-6 text-[#a0b1b4]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  <div>Drag to rotate · scroll to zoom · click to inspect any node.</div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#00dbe9] shrink-0" />
                    <span>Cyan center = topic · bright cyan sources = new this run</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ffb84e] shrink-0" />
                    <span>Amber nodes = search queries generated by the agent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#65f2b5] shrink-0" />
                    <span>Green = memory node — click to see all extracted facts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#9ed8ff] shrink-0" />
                    <span>Muted blue sources = previously indexed (delta filtered)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
