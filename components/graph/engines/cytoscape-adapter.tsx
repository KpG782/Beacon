'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscape from 'cytoscape'
import { GraphData } from '@/lib/graph/types'

const TYPE_COLORS: Record<string, string> = {
  context: '#00dbe9',
  memory: '#65f2b5',
  harness: '#ffb84e',
  source: '#9ed8ff',
  report: '#c084fc',
}

const GRAPH_STYLESHEET = [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        color: '#d8e4e7',
        'font-family': 'JetBrains Mono, monospace',
        'font-size': '10px',
        'text-wrap': 'wrap',
        'text-max-width': '110px',
        'text-valign': 'bottom',
        'text-margin-y': '8px',
        width: 'mapData(size, 6, 14, 24, 52)',
        height: 'mapData(size, 6, 14, 24, 52)',
        'background-color': '#20333a',
        'border-width': 2,
        'border-color': '#2d4952',
      },
    },
    { selector: 'node[type="context"]', style: { 'background-color': 'rgba(0,219,233,0.12)', 'border-color': TYPE_COLORS.context } },
    { selector: 'node[type="memory"]', style: { 'background-color': 'rgba(101,242,181,0.12)', 'border-color': TYPE_COLORS.memory } },
    { selector: 'node[type="harness"]', style: { 'background-color': 'rgba(255,184,78,0.14)', 'border-color': TYPE_COLORS.harness } },
    { selector: 'node[type="source"]', style: { 'background-color': 'rgba(158,216,255,0.12)', 'border-color': TYPE_COLORS.source } },
    { selector: 'node[type="report"]', style: { 'background-color': 'rgba(192,132,252,0.14)', 'border-color': TYPE_COLORS.report } },
    {
      selector: 'edge',
      style: {
        width: 1.8,
        'line-color': 'rgba(0,219,233,0.32)',
        'curve-style': 'bezier',
        'target-arrow-color': 'rgba(0,219,233,0.55)',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.9,
      },
    },
    {
      selector: '.dim',
      style: {
        opacity: 0.25,
      },
    },
    {
      selector: '.focus',
      style: {
        opacity: 1,
        'border-width': 3,
        'line-color': '#7de9ff',
        'target-arrow-color': '#7de9ff',
        width: 2.4,
      },
    },
]

export default function CytoscapeAdapter({ data }: { data: GraphData }) {
  const [selectedId, setSelectedId] = useState<string | null>(data.nodes[0]?.id ?? null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const selectedIdRef = useRef<string | null>(selectedId)

  const elements = useMemo(
    () => [
      ...data.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          detail: node.data?.detail,
          sublabel: node.data?.sublabel,
          size: Number(node.data?.size ?? 9),
        },
      })),
      ...data.edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
        },
      })),
    ],
    [data.edges, data.nodes]
  )

  const selected = useMemo(
    () => data.nodes.find((node) => node.id === selectedId) ?? null,
    [data.nodes, selectedId]
  )

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    const isAlive = () => !cy.destroyed()

    const clearClasses = () => {
      if (!isAlive()) return
      cy.elements().removeClass('dim focus')
    }

    const highlightNode = (id: string) => {
      if (!isAlive()) return
      clearClasses()
      const node = cy.getElementById(id)
      if (!node.length) return
      const neighborhood = node.closedNeighborhood()
      cy.elements().difference(neighborhood).addClass('dim')
      neighborhood.addClass('focus')
    }

    if (selectedIdRef.current) highlightNode(selectedIdRef.current)
    else clearClasses()

    const onTapNode = (event: cytoscape.EventObject) => {
      if (!isAlive()) return
      const id = event.target.id()
      setSelectedId(id)
      highlightNode(id)
    }

    const onMouseOverNode = (event: cytoscape.EventObject) => {
      if (!isAlive()) return
      const id = event.target.id()
      if (!selectedIdRef.current) highlightNode(id)
    }

    const onMouseOutNode = () => {
      if (!isAlive()) return
      if (selectedIdRef.current) highlightNode(selectedIdRef.current)
      else clearClasses()
    }

    const onTapBackground = (event: cytoscape.EventObject) => {
      if (!isAlive()) return
      if (event.target !== cy) return
      setSelectedId(null)
      clearClasses()
    }

    cy.on('tap', 'node', onTapNode)
    cy.on('mouseover', 'node', onMouseOverNode)
    cy.on('mouseout', 'node', onMouseOutNode)
    cy.on('tap', onTapBackground)

    return () => {
      cy.removeListener('tap', 'node', onTapNode)
      cy.removeListener('mouseover', 'node', onMouseOverNode)
      cy.removeListener('mouseout', 'node', onMouseOutNode)
      cy.removeListener('tap', onTapBackground)
    }
  }, [])

  useEffect(() => {
    const cy = cyRef.current
    if (!cy || cy.destroyed()) return
    if (!selectedId) {
      cy.elements().removeClass('dim focus')
      return
    }
    const node = cy.getElementById(selectedId)
    cy.elements().removeClass('dim focus')
    if (!node.length) return
    const neighborhood = node.closedNeighborhood()
    cy.elements().difference(neighborhood).addClass('dim')
    neighborhood.addClass('focus')
  }, [selectedId, elements])

  return (
    <div className="relative h-full w-full bg-[#050608]">
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%', backgroundColor: '#050608' }}
        layout={{ name: 'cose', animate: true, animationDuration: 480, fit: true, padding: 42 }}
        stylesheet={GRAPH_STYLESHEET as unknown as cytoscape.StylesheetJsonBlock[]}
        cy={(cy) => {
          cyRef.current = cy
        }}
      />

      {selected && (
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
      )}
    </div>
  )
}
