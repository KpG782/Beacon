'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, OrbitControls, Sparkles, Text } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import type { Group, Mesh } from 'three'

export interface GraphSceneNode {
  id: string
  label: string
  sublabel: string
  kind: 'topic' | 'report' | 'memory' | 'source'
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

interface PositionedNode extends GraphSceneNode {
  position: [number, number, number]
}

function nodePosition(node: GraphSceneNode, sourceIndex: number, sourceCount: number): [number, number, number] {
  if (node.kind === 'topic') return [0, 0, 0]
  if (node.kind === 'report') return [0, 2.6, 0.2]
  if (node.kind === 'memory') return [-2.7, -1.8, 0.4]

  const angle = (Math.PI * 2 * sourceIndex) / Math.max(sourceCount, 1)
  const radius = 4.5 + (sourceIndex % 2) * 0.55
  const y = Math.sin(angle * 1.4) * 1.35
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius * 0.75
  return [x, y, z]
}

function Signal({
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
  const mesh = useRef<Mesh>(null)

  useFrame((state) => {
    if (!mesh.current) return
    const t = (state.clock.elapsedTime * speed + offset) % 1
    mesh.current.position.set(
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t,
      from[2] + (to[2] - from[2]) * t
    )
  })

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.045, 10, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.95} />
    </mesh>
  )
}

function TopicCore({
  color,
  active,
  onSelect,
}: {
  color: string
  active: boolean
  onSelect: () => void
}) {
  const group = useRef<Group>(null)
  const ring = useRef<Mesh>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.3
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08
    }
    if (ring.current) {
      ring.current.rotation.x = state.clock.elapsedTime * 0.22
      ring.current.rotation.z = state.clock.elapsedTime * 0.18
    }
  })

  return (
    <group ref={group} onClick={onSelect}>
      <mesh scale={0.72}>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.7 : 0.46} roughness={0.22} metalness={0.7} />
      </mesh>
      <mesh ref={ring} scale={1.06}>
        <torusGeometry args={[0.92, 0.05, 18, 72]} />
        <meshStandardMaterial color="#65f2b5" emissive="#65f2b5" emissiveIntensity={0.26} roughness={0.3} metalness={0.65} />
      </mesh>
      <mesh scale={1.38}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#173038" emissive="#173038" emissiveIntensity={0.14} wireframe transparent opacity={0.75} />
      </mesh>
    </group>
  )
}

function GraphNodeMesh({
  node,
  selected,
  onSelect,
}: {
  node: PositionedNode
  selected: boolean
  onSelect: (node: GraphSceneNode) => void
}) {
  const mesh = useRef<Mesh>(null)
  const halo = useRef<Mesh>(null)
  const speed = useMemo(() => 0.3 + Math.random() * 0.25, [])
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    if (!mesh.current) return
    if (node.kind === 'source') {
      mesh.current.rotation.x = state.clock.elapsedTime * speed + offset
      mesh.current.rotation.y = state.clock.elapsedTime * (speed + 0.15) + offset
    }
    if (halo.current) {
      halo.current.rotation.y = state.clock.elapsedTime * 0.4
      halo.current.rotation.x = state.clock.elapsedTime * 0.18
    }
  })

  const geometry = node.kind === 'source'
    ? <sphereGeometry args={[node.size * 0.05, 12, 12]} />
    : <octahedronGeometry args={[node.size * 0.055, 0]} />

  return (
    <group position={node.position}>
      {node.kind === 'topic' ? (
        <TopicCore color={node.color} active={selected} onSelect={() => onSelect(node)} />
      ) : (
        <group onClick={() => onSelect(node)}>
          <mesh ref={mesh}>
            {geometry}
            <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={selected ? 0.7 : 0.34} roughness={0.25} metalness={0.6} />
          </mesh>
          <mesh ref={halo} scale={1.24}>
            <sphereGeometry args={[node.size * 0.05, 10, 10]} />
            <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={0.08} wireframe transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      <Text
        position={[0, -(node.kind === 'topic' ? 1.02 : 0.42), 0]}
        fontSize={node.kind === 'topic' ? 0.16 : 0.11}
        maxWidth={1.6}
        color={selected ? '#f4fbfc' : '#c8d5d8'}
        anchorX="center"
        anchorY="middle"
      >
        {node.label}
      </Text>

      {selected && (
        <Html position={[0, node.kind === 'topic' ? 1.12 : 0.62, 0]} center>
          <div className="border border-cyan-400/20 bg-black/80 px-2.5 py-2 text-[10px] text-[#d8e4e7] shadow-[0_0_18px_rgba(0,0,0,0.4)]">
            <div className="uppercase tracking-[0.2em] text-cyan-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {node.kind}
            </div>
            <div style={{ fontFamily: 'var(--font-space-grotesk)' }}>{node.sublabel}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

function Scene({
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
  const positioned = useMemo(() => {
    const sources = nodes.filter((node) => node.kind === 'source')
    let sourceIndex = 0
    return nodes.map((node) => {
      const position =
        node.kind === 'source'
          ? nodePosition(node, sourceIndex++, sources.length)
          : nodePosition(node, 0, sources.length)
      return { ...node, position }
    })
  }, [nodes])

  const map = useMemo(
    () => Object.fromEntries(positioned.map((node) => [node.id, node])),
    [positioned]
  )

  return (
    <>
      <color attach="background" args={['#050608']} />
      <fog attach="fog" args={['#050608', 8, 18]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[5, 6, 5]} intensity={0.9} color="#e8feff" />
      <pointLight position={[-5, -2, -4]} intensity={0.72} color="#65f2b5" />
      <pointLight position={[4, 2, 4]} intensity={0.78} color="#00dbe9" />

      {links.map((link, index) => {
        const from = map[link.from]
        const to = map[link.to]
        if (!from || !to) return null
        const speed = 0.08 + (index % 5) * 0.018
        return (
          <group key={`${link.from}-${link.to}`}>
            <Line points={[from.position, to.position]} color={link.color} lineWidth={0.85} transparent opacity={0.48} />
            <Signal from={from.position} to={to.position} color={from.color} speed={speed} offset={index * 0.13} />
          </group>
        )
      })}

      {positioned.map((node) => (
        <GraphNodeMesh
          key={node.id}
          node={node}
          selected={selectedNodeId === node.id}
          onSelect={onSelect}
        />
      ))}

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1.8]}>
        <torusGeometry args={[5.5, 0.02, 20, 160]} />
        <meshStandardMaterial color="#173038" emissive="#173038" emissiveIntensity={0.14} />
      </mesh>
      <Sparkles count={42} scale={9} size={1.6} speed={0.35} color="#7de9ff" />
      <OrbitControls enablePan enableZoom autoRotate autoRotateSpeed={0.28} />
    </>
  )
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
  return (
    <div className="relative h-[360px] overflow-hidden border border-white/8 bg-[#050608] sm:h-[440px] md:h-[540px] lg:h-[620px] xl:h-[680px]">
      <Canvas camera={{ position: [0, 0.4, 9.2], fov: 42 }}>
        <Scene
          nodes={nodes}
          links={links}
          selectedNodeId={selectedNodeId}
          onSelect={onSelect}
        />
      </Canvas>
      <div className="pointer-events-none absolute left-3 top-3 border border-cyan-400/15 bg-black/50 px-2 py-1.5 text-[9px] uppercase tracking-[0.18em] text-cyan-300 sm:left-4 sm:top-4 sm:px-3 sm:py-2 sm:text-[10px] sm:tracking-[0.22em]">
        Interactive 3D mesh
      </div>
      <div className="pointer-events-none absolute right-3 top-3 border border-white/10 bg-black/50 px-2 py-1.5 text-[9px] uppercase tracking-[0.18em] text-[#d9e5e7] sm:right-4 sm:top-4 sm:px-3 sm:py-2 sm:text-[10px] sm:tracking-[0.22em]">
        Drag • zoom • orbit • inspect
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#050608] to-transparent sm:h-24 md:h-28" />
    </div>
  )
}
