'use client'

import { GraphProvider } from '@/components/graph/graph-provider'
import { GraphData } from '@/lib/graph/types'

const BEACON_ARCHITECTURE_GRAPH: GraphData = {
  nodes: [
    { id: 'user-query', label: 'User Query', type: 'context', data: { detail: 'Entry point for each research brief.', position: [-3.7, 0.85, 0.3], color: '#00dbe9' } },
    { id: 'context-builder', label: 'Context Builder', type: 'context', data: { detail: 'Builds the brief lens, scope, and research method.', position: [-1.8, 1.45, 0.35], color: '#00dbe9' } },
    { id: 'memory-bank', label: 'Memory Bank', type: 'memory', data: { detail: 'Persistent cross-run memory and URL dedup state.', position: [0.35, 1.65, -0.2], color: '#65f2b5' } },
    { id: 'workflow-engine', label: 'Workflow Engine', type: 'harness', data: { detail: 'Durable orchestrator that runs idempotent steps.', position: [2.2, 1.1, -0.3], color: '#ffb84e' } },
    { id: 'web-search', label: 'Web Search', type: 'source', data: { detail: 'Parallel retrieval from live web sources.', position: [3.85, 0.15, -0.25], color: '#9ed8ff' } },
    { id: 'evidence-ranker', label: 'Evidence Ranker', type: 'harness', data: { detail: 'Ranks and clusters evidence quality and relevance.', position: [2.95, -1.1, 0.2], color: '#ffb84e' } },
    { id: 'insight-synthesizer', label: 'Insight Synthesizer', type: 'report', data: { detail: 'Synthesizes findings into cited insight blocks.', position: [0.95, -1.75, 0.45], color: '#c084fc' } },
    { id: 'risk-detector', label: 'Risk Detector', type: 'harness', data: { detail: 'Flags contradictions, uncertainty, and risk areas.', position: [-1.35, -1.55, 0.55], color: '#ffb84e' } },
    { id: 'delta-report', label: 'Delta Report', type: 'report', data: { detail: 'Highlights only what changed since prior runs.', position: [-3.0, -0.85, -0.2], color: '#c084fc' } },
    { id: 'final-brief', label: 'Final Brief', type: 'report', data: { detail: 'Final decision-grade brief ready to ship.', position: [-0.55, 0.15, 1.35], color: '#65f2b5' } },
  ],
  edges: [
    { id: 'u-c', source: 'user-query', target: 'context-builder', animated: true },
    { id: 'c-m', source: 'context-builder', target: 'memory-bank', animated: true },
    { id: 'm-w', source: 'memory-bank', target: 'workflow-engine', animated: true },
    { id: 'w-s', source: 'workflow-engine', target: 'web-search', animated: true },
    { id: 's-e', source: 'web-search', target: 'evidence-ranker', animated: true },
    { id: 'e-i', source: 'evidence-ranker', target: 'insight-synthesizer', animated: true },
    { id: 'i-r', source: 'insight-synthesizer', target: 'risk-detector', animated: true },
    { id: 'r-d', source: 'risk-detector', target: 'delta-report', animated: true },
    { id: 'd-f', source: 'delta-report', target: 'final-brief', animated: true },
    { id: 'm-f', source: 'memory-bank', target: 'final-brief', animated: true },
    { id: 'c-r', source: 'context-builder', target: 'risk-detector', animated: true },
    { id: 'w-i', source: 'workflow-engine', target: 'insight-synthesizer', animated: true },
  ],
}

export default function ArchitectureScene() {
  return (
    <div className="relative w-full overflow-hidden border border-white/8 bg-[#0a0a0a]">
      <GraphProvider data={BEACON_ARCHITECTURE_GRAPH} defaultEngine="threejs" className="h-[480px] w-full md:h-[540px]" />
    </div>
  )
}
