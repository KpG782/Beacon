'use client'

import { GraphProvider } from './graph-provider'
import { GraphData } from '@/lib/graph/types'

export interface GraphSceneNode {
  id: string
  label: string
  sublabel: string
  kind: 'topic' | 'report' | 'memory' | 'source' | 'query'
  color: string
  size: number
  detail?: string
  url?: string
  meta?: string[]
}

export interface GraphSceneLink {
  from: string
  to: string
  color: string
}

function toGraphData(nodes: GraphSceneNode[], links: GraphSceneLink[]): GraphData {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      label: node.label,
      type:
        node.kind === 'topic' || node.kind === 'query'
          ? 'context'
          : node.kind === 'memory'
            ? 'memory'
            : node.kind === 'source'
              ? 'source'
              : 'report',
      data: {
        detail: node.detail,
        sublabel: node.sublabel,
        color: node.color,
        size: node.size,
        meta: node.meta,
        url: node.url,
      },
    })),
    edges: links.map((link, index) => ({
      id: `${link.from}-${link.to}-${index}`,
      source: link.from,
      target: link.to,
      animated: true,
    })),
  }
}

export default function ResearchGraphScene({
  nodes,
  links,
  selectedNodeId,
  onSelect,
}: {
  nodes: GraphSceneNode[]
  links: GraphSceneLink[]
  selectedNodeId: string | null
  onSelect: (node: GraphSceneNode) => void
}) {
  const graphData = toGraphData(nodes, links)

  return (
    <div className="relative h-[360px] overflow-hidden border border-white/8 bg-[#050608] sm:h-[440px] md:h-[540px] lg:h-[620px] xl:h-[680px]">
      <GraphProvider
        data={graphData}
        defaultEngine="sigmajs"
        className="h-full w-full"
        selectedNodeId={selectedNodeId}
        onSelectNode={(id) => {
          if (!id) return
          const node = nodes.find((item) => item.id === id)
          if (node) onSelect(node)
        }}
      />
    </div>
  )
}
