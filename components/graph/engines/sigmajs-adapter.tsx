'use client'

import '@react-sigma/core/lib/style.css'
import {
  ControlsContainer,
  FullScreenControl,
  SigmaContainer,
  ZoomControl,
  useRegisterEvents,
  useSigma,
} from '@react-sigma/core'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import { MultiDirectedGraph } from 'graphology'
import type Sigma from 'sigma'
import { useEffect, useMemo, useRef, useState } from 'react'
import { GraphData } from '@/lib/graph/types'

const TYPE_STYLE: Record<string, { color: string; size: number }> = {
  context: { color: '#00dbe9', size: 12 },
  memory: { color: '#65f2b5', size: 11 },
  harness: { color: '#ffb84e', size: 10 },
  source: { color: '#9ed8ff', size: 8 },
  report: { color: '#c084fc', size: 10.5 },
}

function SigmaInteractions({
  hoveredId,
  selectedId,
  onHover,
  onSelect,
}: {
  hoveredId: string | null
  selectedId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
}) {
  const sigma = useSigma()
  const registerEvents = useRegisterEvents()
  const killedRef = useRef(false)

  useEffect(() => {
    const markKilled = () => {
      killedRef.current = true
    }

    killedRef.current = false
    sigma.on('kill', markKilled)

    return () => {
      sigma.off('kill', markKilled)
      killedRef.current = true
    }
  }, [sigma])

  const safeRefresh = (instance: Sigma) => {
    if (killedRef.current) return
    if (!instance.getContainer().isConnected) return

    try {
      instance.refresh()
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Sigma refresh skipped after renderer teardown.', error)
      }
    }
  }

  useEffect(() => {
    registerEvents({
      enterNode: ({ node }) => onHover(node),
      leaveNode: () => onHover(null),
      clickNode: ({ node }) => onSelect(node),
      clickStage: () => onSelect(null),
    })
  }, [onHover, onSelect, registerEvents])

  useEffect(() => {
    const focus = selectedId ?? hoveredId
    const graph = sigma.getGraph()
    if (!focus) {
      sigma.setSetting('nodeReducer', null)
      sigma.setSetting('edgeReducer', null)
      safeRefresh(sigma)
      return
    }

    if (!graph.hasNode(focus)) {
      sigma.setSetting('nodeReducer', null)
      sigma.setSetting('edgeReducer', null)
      safeRefresh(sigma)
      return
    }

    const connected = new Set<string>([focus])
    graph.forEachNeighbor(focus, (neighbor) => connected.add(neighbor))

    sigma.setSetting('nodeReducer', (node, data) => {
      if (connected.has(node)) {
        return {
          ...data,
          zIndex: node === focus ? 10 : 7,
          forceLabel: true,
          highlighted: node === focus,
        }
      }
      return {
        ...data,
        color: '#2a3338',
        labelColor: '#566268',
        hidden: false,
      }
    })

    sigma.setSetting('edgeReducer', (edge, data) => {
      const source = graph.source(edge)
      const target = graph.target(edge)
      if (connected.has(source) && connected.has(target)) {
        return {
          ...data,
          color: '#7de9ff',
          size: 2.2,
          hidden: false,
        }
      }
      return {
        ...data,
        color: 'rgba(72,96,104,0.22)',
        size: 1,
        hidden: false,
      }
    })

    safeRefresh(sigma)
  }, [hoveredId, selectedId, sigma])

  return null
}

function SigmaInspector({
  data,
  selectedId,
}: {
  data: GraphData
  selectedId: string | null
}) {
  const selected = useMemo(() => data.nodes.find((node) => node.id === selectedId) ?? null, [data.nodes, selectedId])
  if (!selected) return null

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 w-[220px] border border-white/12 bg-black/75 p-3 text-[11px] leading-5 text-[#d2dde0] sm:right-4 sm:top-4">
      <div className="text-[9px] uppercase tracking-[0.2em] text-cyan-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        Node inspector
      </div>
      <div className="mt-1 text-[13px] text-[#eef4f6]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        {selected.label}
      </div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        {selected.type}
      </div>
      {typeof selected.data?.sublabel === 'string' && (
        <div className="mt-1 text-[10px] text-[#9bb0b4]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          {selected.data.sublabel}
        </div>
      )}
      {typeof selected.data?.detail === 'string' && (
        <p className="mt-2 text-[11px] leading-5 text-[#b8c8cc]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          {selected.data.detail}
        </p>
      )}
    </div>
  )
}

export default function SigmajsAdapter({
  data,
  selectedNodeId = null,
  onSelectNode,
}: {
  data: GraphData
  selectedNodeId?: string | null
  onSelectNode?: (id: string | null) => void
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(data.nodes[0]?.id ?? null)

  const graph = useMemo(() => {
    const g = new MultiDirectedGraph()
    const typedBuckets = new Map<string, number>()

    data.nodes.forEach((node) => {
      const style = TYPE_STYLE[node.type] ?? { color: '#6d767c', size: 8 }
      const bucket = typedBuckets.get(node.type) ?? 0
      typedBuckets.set(node.type, bucket + 1)

      const angle = (Math.PI * 2 * bucket) / Math.max(3, data.nodes.filter((n) => n.type === node.type).length)
      const radius =
        node.type === 'context'
          ? 1.5
          : node.type === 'memory'
            ? 2.3
            : node.type === 'harness'
              ? 3.05
              : node.type === 'report'
                ? 3.6
                : 4.1

      g.addNode(node.id, {
        x: Math.cos(angle) * radius + (Math.random() - 0.5) * 0.35,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 0.35,
        size: style.size,
        label: node.label,
        color: style.color,
        detail: node.data?.detail,
        sublabel: node.data?.sublabel,
      })
    })

    data.edges.forEach((edge) => {
      if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
        g.addEdgeWithKey(edge.id, edge.source, edge.target, {
          size: edge.animated ? 1.8 : 1.4,
          color: 'rgba(0, 219, 233, 0.34)',
        })
      }
    })

    if (g.order > 0) {
      forceAtlas2.assign(g, {
        iterations: 90,
        settings: {
          gravity: 1.1,
          scalingRatio: 12,
          strongGravityMode: false,
          barnesHutOptimize: true,
        },
      })
    }

    return g
  }, [data.edges, data.nodes])

  useEffect(() => {
    const nextSelectedId =
      selectedNodeId && data.nodes.some((node) => node.id === selectedNodeId)
        ? selectedNodeId
        : data.nodes[0]?.id ?? null

    setSelectedId(nextSelectedId)
  }, [data.nodes, selectedNodeId])

  return (
    <div className="relative h-full w-full bg-[#050608]">
      <SigmaContainer
        graph={graph}
        style={{ width: '100%', height: '100%', backgroundColor: '#050608' }}
        settings={{
          renderLabels: true,
          labelDensity: 0.5,
          labelRenderedSizeThreshold: 6,
          zIndex: true,
        }}
      >
        <SigmaInteractions
          hoveredId={hoveredId}
          selectedId={selectedId}
          onHover={setHoveredId}
          onSelect={(id) => {
            setSelectedId(id)
            onSelectNode?.(id)
          }}
        />
        <ControlsContainer position="bottom-right">
          <ZoomControl />
          <FullScreenControl />
        </ControlsContainer>
      </SigmaContainer>
      <SigmaInspector data={data} selectedId={selectedId} />
    </div>
  )
}
