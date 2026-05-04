'use client'

import { Html, Line, OrbitControls, Sparkles } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import type { Mesh } from 'three'
import { GraphData } from '@/lib/graph/types'

type PositionedNode = GraphData['nodes'][number] & {
  position: [number, number, number]
  color: string
}

const TYPE_COLOR: Record<string, string> = {
  context: '#00dbe9',
  memory: '#65f2b5',
  harness: '#ffb84e',
  source: '#9ed8ff',
  report: '#c084fc',
}

function layoutNodes(nodes: GraphData['nodes']): PositionedNode[] {
  const radiusByRing = [2.05, 3.15, 4.1]
  return nodes.map((node, index) => {
    const explicit = node.data?.position
    if (Array.isArray(explicit) && explicit.length === 3) {
      return {
        ...node,
        position: [explicit[0], explicit[1], explicit[2]],
        color: (node.data?.color as string) ?? TYPE_COLOR[node.type] ?? '#9aa4a8',
      }
    }

    const ring = index < 4 ? 0 : index < 8 ? 1 : 2
    const ringItems = ring === 0 ? Math.min(nodes.length, 4) : ring === 1 ? Math.min(Math.max(nodes.length - 4, 0), 4) : Math.max(nodes.length - 8, 1)
    const ringIndex = ring === 0 ? index : ring === 1 ? index - 4 : index - 8
    const angle = (Math.PI * 2 * ringIndex) / Math.max(ringItems, 1) + ring * 0.4
    const radius = radiusByRing[ring]
    const y = ring === 0 ? Math.sin(angle * 1.2) * 0.8 : ring === 1 ? Math.sin(angle * 1.5) * 1.2 : Math.sin(angle * 1.7) * 1.45
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius * 0.72

    return {
      ...node,
      position: [x, y, z],
      color: (node.data?.color as string) ?? TYPE_COLOR[node.type] ?? '#9aa4a8',
    }
  })
}

function FlowPacket({
  from,
  to,
  color,
  speed,
  offset,
}: {
  from: [number, number, number]
  to: [number, number, number]
  color: string
  speed: number
  offset: number
}) {
  const ref = useRef<Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = (state.clock.elapsedTime * speed + offset) % 1
    ref.current.position.set(
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t,
      from[2] + (to[2] - from[2]) * t
    )
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.042, 10, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.05} />
    </mesh>
  )
}

function NeuralNode({
  node,
  connected,
  active,
  onHover,
  onLeave,
  onSelect,
}: {
  node: PositionedNode
  connected: boolean
  active: boolean
  onHover: (id: string) => void
  onLeave: () => void
  onSelect: (id: string) => void
}) {
  const mesh = useRef<Mesh>(null)
  const halo = useRef<Mesh>(null)
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    if (!mesh.current || !halo.current) return
    mesh.current.rotation.x = state.clock.elapsedTime * 0.35 + offset
    mesh.current.rotation.y = state.clock.elapsedTime * 0.45 + offset
    mesh.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime * 1.25 + offset) * 0.07

    halo.current.rotation.y = state.clock.elapsedTime * 0.2
    halo.current.rotation.x = state.clock.elapsedTime * 0.12
    halo.current.position.y = mesh.current.position.y
  })

  const dimmed = !active && !connected
  const emissiveIntensity = active ? 1.1 : connected ? 0.7 : 0.35
  const opacity = dimmed ? 0.45 : 1

  return (
    <group
      position={node.position}
      onPointerOver={(event) => {
        event.stopPropagation()
        onHover(node.id)
      }}
      onPointerOut={onLeave}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(node.id)
      }}
    >
      <mesh ref={mesh} scale={node.id === 'user-query' ? 1.2 : 1}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={emissiveIntensity} transparent opacity={opacity} />
      </mesh>
      <mesh ref={halo} scale={1.7}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={0.25} transparent opacity={dimmed ? 0.18 : 0.5} />
      </mesh>

      <Html position={[0, -0.36, 0]} center transform sprite>
        <div
          className={`border px-2 py-1 text-[9px] uppercase tracking-[0.14em] whitespace-nowrap ${
            active ? 'border-cyan-300/35 bg-black/80 text-[#f2f8f9]' : 'border-white/12 bg-black/65 text-[#c7d4d7]'
          }`}
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {node.label}
        </div>
      </Html>
    </group>
  )
}

function AutoCamera() {
  const { camera, pointer } = useThree()
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.12
    const radius = 8.6
    const x = Math.cos(t) * radius + pointer.x * 0.35
    const z = Math.sin(t) * radius + pointer.y * 0.35
    const y = 2.2 + Math.sin(t * 1.25) * 0.4
    camera.position.x += (x - camera.position.x) * 0.04
    camera.position.y += (y - camera.position.y) * 0.04
    camera.position.z += (z - camera.position.z) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return null
}

function Scene({
  data,
  hoveredId,
  selectedId,
  onHover,
  onLeave,
  onSelect,
}: {
  data: GraphData
  hoveredId: string | null
  selectedId: string | null
  onHover: (id: string) => void
  onLeave: () => void
  onSelect: (id: string) => void
}) {
  const positioned = useMemo(() => layoutNodes(data.nodes), [data.nodes])
  const nodeMap = useMemo(() => Object.fromEntries(positioned.map((n) => [n.id, n])), [positioned])

  const focusNodeId = selectedId ?? hoveredId
  const linkedIds = useMemo(() => {
    if (!focusNodeId) return new Set<string>()
    const ids = new Set<string>([focusNodeId])
    data.edges.forEach((edge) => {
      if (edge.source === focusNodeId) ids.add(edge.target)
      if (edge.target === focusNodeId) ids.add(edge.source)
    })
    return ids
  }, [data.edges, focusNodeId])

  return (
    <>
      <color attach="background" args={['#08090c']} />
      <fog attach="fog" args={['#08090c', 8, 17]} />
      <ambientLight intensity={0.74} />
      <directionalLight position={[5, 6, 4]} intensity={1.05} color="#dffcff" />
      <pointLight position={[-4, -1.5, -3]} intensity={0.8} color="#00dbe9" />
      <pointLight position={[4, 2.2, 2]} intensity={0.7} color="#c084fc" />
      <pointLight position={[0, 4, -2]} intensity={0.6} color="#ffb84e" />

      {data.edges.map((edge, index) => {
        const from = nodeMap[edge.source]
        const to = nodeMap[edge.target]
        if (!from || !to) return null

        const highlighted = linkedIds.has(edge.source) && linkedIds.has(edge.target)
        const edgeOpacity = highlighted ? 0.75 : focusNodeId ? 0.16 : 0.38
        const color = highlighted ? '#7de9ff' : '#2d4952'
        return (
          <group key={edge.id}>
            <Line points={[from.position, to.position]} color={color} lineWidth={1.1} transparent opacity={edgeOpacity} />
            <FlowPacket
              from={from.position}
              to={to.position}
              color={highlighted ? from.color : '#59b8c2'}
              speed={0.14 + (index % 4) * 0.03}
              offset={index * 0.17}
            />
          </group>
        )
      })}

      {positioned.map((node) => (
        <NeuralNode
          key={node.id}
          node={node}
          connected={focusNodeId ? linkedIds.has(node.id) : true}
          active={node.id === focusNodeId}
          onHover={onHover}
          onLeave={onLeave}
          onSelect={onSelect}
        />
      ))}

      <mesh rotation={[Math.PI / 2.2, 0, 0]} position={[0, -0.05, -1.45]}>
        <torusGeometry args={[4.6, 0.02, 16, 140]} />
        <meshStandardMaterial color="#20262c" emissive="#20262c" emissiveIntensity={0.15} />
      </mesh>
      <Sparkles count={48} scale={8.5} size={1.55} speed={0.32} color="#7de9ff" />
      <AutoCamera />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.14} />
    </>
  )
}

export default function ThreejsAdapter({ data }: { data: GraphData }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(data.nodes[0]?.id ?? null)

  const selected = useMemo(
    () => data.nodes.find((node) => node.id === selectedId) ?? data.nodes[0] ?? null,
    [data.nodes, selectedId]
  )

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [7.8, 2.2, 7.8], fov: 42 }}>
        <Scene
          data={data}
          hoveredId={hoveredId}
          selectedId={selectedId}
          onHover={setHoveredId}
          onLeave={() => setHoveredId(null)}
          onSelect={setSelectedId}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="pointer-events-none absolute left-4 top-4 border border-cyan-400/18 bg-black/65 px-3 py-2">
        <div className="text-[9px] uppercase tracking-[0.2em] text-cyan-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Neural-link network
        </div>
      </div>

      {selected && (
        <div className="pointer-events-none absolute right-4 top-4 w-[220px] border border-white/12 bg-black/75 p-3 text-[11px] leading-5 text-[#d2dde0]">
          <div className="text-[9px] uppercase tracking-[0.18em] text-cyan-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Selected node
          </div>
          <div className="mt-1 text-[13px] text-[#eef4f6]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {selected.label}
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[#8ea1a5]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {selected.type}
          </div>
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
