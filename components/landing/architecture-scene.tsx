'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Html, Line, OrbitControls, Sparkles } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'

const NODES: Array<{
  id: string
  color: string
  position: [number, number, number]
  scale?: number
}> = [
  { id: 'context', color: '#00dbe9', position: [-2.8, 1.45, 0.5], scale: 0.55 },
  { id: 'memory', color: '#65f2b5', position: [2.45, 0.25, -0.25], scale: 0.62 },
  { id: 'harness', color: '#ffb84e', position: [-0.15, -2.2, 0.2], scale: 0.68 },
  { id: 'mcp', color: '#9ed8ff', position: [2.85, 1.95, 0.15], scale: 0.4 },
  { id: 'cli', color: '#d7fff1', position: [-3.2, -1.05, -0.25], scale: 0.38 },
  { id: 'runs', color: '#ffd694', position: [0.25, 2.85, -0.45], scale: 0.35 },
]

const LINKS: Array<{
  id: string
  from: [number, number, number]
  to: [number, number, number]
  color: string
  speed: number
  offset: number
}> = [
  { id: 'context-core', from: [-2.8, 1.45, 0.5], to: [0, 0, 0], color: '#00dbe9', speed: 0.22, offset: 0.1 },
  { id: 'memory-core', from: [2.45, 0.25, -0.25], to: [0, 0, 0], color: '#65f2b5', speed: 0.26, offset: 0.45 },
  { id: 'harness-core', from: [-0.15, -2.2, 0.2], to: [0, 0, 0], color: '#ffb84e', speed: 0.2, offset: 0.75 },
  { id: 'mcp-memory', from: [2.85, 1.95, 0.15], to: [2.45, 0.25, -0.25], color: '#9ed8ff', speed: 0.18, offset: 0.2 },
  { id: 'cli-harness', from: [-3.2, -1.05, -0.25], to: [-0.15, -2.2, 0.2], color: '#d7fff1', speed: 0.15, offset: 0.58 },
  { id: 'runs-context', from: [0.25, 2.85, -0.45], to: [-2.8, 1.45, 0.5], color: '#ffd694', speed: 0.17, offset: 0.88 },
]

const SOURCE_NODES: Array<{
  id: string
  title: string
  position: [number, number, number]
  color: string
}> = [
  { id: 'source-1', title: 'pricing url', position: [-4.15, 2.8, -0.8], color: '#00dbe9' },
  { id: 'source-2', title: 'launch url', position: [4.2, 2.25, -1.2], color: '#65f2b5' },
  { id: 'source-3', title: 'market url', position: [4.45, -1.35, -0.95], color: '#ffd694' },
  { id: 'source-4', title: 'ops url', position: [-4.35, -1.95, -1.1], color: '#9ed8ff' },
]

const SOURCE_LINKS: Array<{
  id: string
  from: [number, number, number]
  to: [number, number, number]
  color: string
  speed: number
  offset: number
}> = [
  { id: 'source-link-1', from: [-4.15, 2.8, -0.8], to: [-2.8, 1.45, 0.5], color: '#00dbe9', speed: 0.12, offset: 0.12 },
  { id: 'source-link-2', from: [4.2, 2.25, -1.2], to: [2.85, 1.95, 0.15], color: '#65f2b5', speed: 0.14, offset: 0.37 },
  { id: 'source-link-3', from: [4.45, -1.35, -0.95], to: [2.45, 0.25, -0.25], color: '#ffd694', speed: 0.11, offset: 0.58 },
  { id: 'source-link-4', from: [-4.35, -1.95, -1.1], to: [-3.2, -1.05, -0.25], color: '#9ed8ff', speed: 0.1, offset: 0.81 },
]

function Core() {
  const group = useRef<Group>(null)
  const shell = useRef<Mesh>(null)
  const innerRing = useRef<Mesh>(null)
  const cage = useRef<Mesh>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.35
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.08
    }
    if (shell.current) {
      shell.current.rotation.x = state.clock.elapsedTime * 0.2
      shell.current.rotation.z = state.clock.elapsedTime * 0.25
    }
    if (innerRing.current) {
      innerRing.current.rotation.y = state.clock.elapsedTime * -0.28
      innerRing.current.rotation.x = state.clock.elapsedTime * 0.18
    }
    if (cage.current) {
      cage.current.rotation.y = state.clock.elapsedTime * -0.18
      cage.current.rotation.z = state.clock.elapsedTime * 0.12
    }
  })

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#00dbe9" emissive="#00dbe9" emissiveIntensity={0.55} roughness={0.2} metalness={0.55} />
      </mesh>
      <mesh ref={shell} scale={1.5}>
        <torusGeometry args={[1.05, 0.06, 18, 64]} />
        <meshStandardMaterial color="#65f2b5" emissive="#65f2b5" emissiveIntensity={0.35} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh ref={innerRing} scale={1.2} rotation={[Math.PI / 3.2, 0, 0]}>
        <torusGeometry args={[0.92, 0.04, 16, 56]} />
        <meshStandardMaterial color="#ffb84e" emissive="#ffb84e" emissiveIntensity={0.25} roughness={0.35} metalness={0.65} />
      </mesh>
      <mesh ref={cage} scale={1.95}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#20333a" emissive="#20333a" emissiveIntensity={0.18} wireframe transparent opacity={0.75} />
      </mesh>
    </group>
  )
}

function LayerNode({
  color,
  position,
  scale = 0.55,
}: {
  color: string
  position: [number, number, number]
  scale?: number
}) {
  const mesh = useRef<Mesh>(null)
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.x = state.clock.elapsedTime * 0.7 + offset
    mesh.current.rotation.y = state.clock.elapsedTime * 0.9 + offset
    mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2 + offset) * 0.12
  })

  return (
    <Float speed={2} rotationIntensity={0.7} floatIntensity={0.6}>
      <mesh ref={mesh} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} roughness={0.25} metalness={0.6} />
      </mesh>
    </Float>
  )
}

function LinkBeam({
  from,
  to,
  color,
}: {
  from: [number, number, number]
  to: [number, number, number]
  color: string
}) {
  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={1.4}
      transparent
      opacity={0.48}
    />
  )
}

function SignalPacket({
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
  const packet = useRef<Mesh>(null)

  useFrame((state) => {
    if (!packet.current) return
    const t = (state.clock.elapsedTime * speed + offset) % 1
    packet.current.position.set(
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t,
      from[2] + (to[2] - from[2]) * t
    )
  })

  return (
    <mesh ref={packet}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} />
    </mesh>
  )
}

function SceneContent() {
  return (
    <>
      <color attach="background" args={['#0b0d10']} />
      <fog attach="fog" args={['#0b0d10', 7, 16]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} color="#dffcff" />
      <pointLight position={[-5, -2, -4]} intensity={1.1} color="#65f2b5" />
      <pointLight position={[5, 2, 3]} intensity={1.1} color="#00dbe9" />

      <group rotation={[0.35, -0.5, 0]}>
        <Core />
        {NODES.map((node) => (
          <LayerNode
            key={node.id}
            color={node.color}
            position={node.position}
            scale={node.scale}
          />
        ))}

        {LINKS.map((link) => (
          <group key={link.id}>
            <LinkBeam from={link.from} to={link.to} color={link.color} />
            <SignalPacket
              from={link.from}
              to={link.to}
              color={link.color}
              speed={link.speed}
              offset={link.offset}
            />
          </group>
        ))}

        {SOURCE_LINKS.map((link) => (
          <group key={link.id}>
            <LinkBeam from={link.from} to={link.to} color={link.color} />
            <SignalPacket
              from={link.from}
              to={link.to}
              color={link.color}
              speed={link.speed}
              offset={link.offset}
            />
          </group>
        ))}

        {SOURCE_NODES.map((node) => (
          <group key={node.id} position={node.position}>
            <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.5}>
              <mesh>
                <sphereGeometry args={[0.18, 18, 18]} />
                <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={0.55} />
              </mesh>
              <mesh scale={1.85}>
                <sphereGeometry args={[0.18, 18, 18]} />
                <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={0.18} wireframe transparent opacity={0.55} />
              </mesh>
            </Float>
            <Html position={[0, -0.42, 0]} center transform sprite>
              <div
                className="border border-white/10 bg-black/70 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[#d8e4e7] whitespace-nowrap"
                style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              >
                {node.title}
              </div>
            </Html>
          </group>
        ))}

        <mesh rotation={[Math.PI / 2.2, 0, 0]} position={[0, 0, -0.8]}>
          <torusGeometry args={[3.25, 0.035, 20, 120]} />
          <meshStandardMaterial color="#20333a" emissive="#20333a" emissiveIntensity={0.25} />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, 0, 0]} position={[0, 0, -1.35]}>
          <torusGeometry args={[4.1, 0.02, 20, 140]} />
          <meshStandardMaterial color="#173038" emissive="#173038" emissiveIntensity={0.22} />
        </mesh>
      </group>

      <Sparkles count={80} scale={9} size={2.2} speed={0.55} color="#7de9ff" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.45} />
    </>
  )
}

const LAYER_LEGEND = [
  { color: '#00dbe9', dot: 'bg-[#00dbe9]', label: 'Context', role: 'Per-request intelligence' },
  { color: '#65f2b5', dot: 'bg-[#65f2b5]', label: 'Memory', role: 'Cross-session state' },
  { color: '#ffb84e', dot: 'bg-[#ffb84e]', label: 'Harness', role: 'Reliability + logs' },
  { color: '#9ed8ff', dot: 'bg-[#9ed8ff]', label: 'MCP', role: 'External agent access' },
]

// Simulated run history depths — higher = more memory accumulated
const HEATMAP_RUNS = [
  [0.18, 0.15, 0.12, 0.10],
  [0.38, 0.32, 0.25, 0.20],
  [0.55, 0.48, 0.38, 0.30],
  [0.70, 0.62, 0.50, 0.42],
  [0.82, 0.74, 0.60, 0.52],
  [0.92, 0.85, 0.72, 0.62],
]

const HEATMAP_COLORS = ['#00dbe9', '#65f2b5', '#ffb84e', '#9ed8ff']

export default function ArchitectureScene() {
  return (
    <div className="relative w-full overflow-hidden border border-white/8 bg-[#0b0d10]">
      {/* 3D Canvas */}
      <div className="h-[480px] md:h-[540px]">
        <Canvas camera={{ position: [0, 0, 7], fov: 42 }}>
          <SceneContent />
        </Canvas>
      </div>

      {/* Top gradient line */}
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,219,233,0.7),transparent)] opacity-60" />

      {/* ── Title badge (top-left) ── */}
      <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2.5 border border-cyan-400/20 bg-black/60 px-3 py-2 backdrop-blur-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
        <span className="text-[10px] uppercase tracking-[0.22em] text-cyan-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Neural memory mesh — live
        </span>
      </div>

      {/* ── Layer legend (top-right) ── */}
      <div className="pointer-events-none absolute right-5 top-5 flex flex-col gap-1.5 border border-white/8 bg-black/60 px-3 py-3 backdrop-blur-sm">
        <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-[#5a6e72]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Active layers
        </div>
        {LAYER_LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${l.dot}`} />
            <span className="text-[10px] text-[#c4d4d7]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span style={{ color: l.color }}>{l.label}</span>
              <span className="ml-1 text-[#5a6e72]">— {l.role}</span>
            </span>
          </div>
        ))}
      </div>

      {/* ── Signal annotation (mid-left) ── */}
      <div className="pointer-events-none absolute left-5 bottom-[160px] hidden border border-white/8 bg-black/55 px-3 py-2.5 backdrop-blur-sm md:block max-w-[200px]">
        <div className="text-[9px] uppercase tracking-[0.2em] text-[#5a6e72] mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Signal packets</div>
        <p className="text-[11px] leading-[1.55] text-[#b4c8cc]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Each moving dot is a data flow — source URLs entering the context layer, facts persisting to memory.
        </p>
      </div>

      {/* ── Memory depth heatmap (bottom-right) ── */}
      <div className="pointer-events-none absolute right-5 bottom-5 hidden flex-col gap-2 md:flex">
        <div className="text-[9px] uppercase tracking-[0.2em] text-[#5a6e72]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Memory depth — 6 runs
        </div>
        <div className="flex items-end gap-1">
          {HEATMAP_RUNS.map((runDepths, runIdx) => (
            <div key={runIdx} className="flex flex-col-reverse gap-0.5">
              {runDepths.map((opacity, layerIdx) => (
                <div
                  key={layerIdx}
                  className="h-3 w-3 border border-white/5"
                  style={{
                    background: HEATMAP_COLORS[layerIdx],
                    opacity,
                    animationDelay: `${runIdx * 0.12 + layerIdx * 0.04}s`,
                  }}
                />
              ))}
              <div className="text-center text-[8px] text-[#3a4a4c]" style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                R{runIdx + 1}
              </div>
            </div>
          ))}
          <div className="ml-1 flex flex-col-reverse gap-0.5 pb-4">
            {LAYER_LEGEND.map((l, i) => (
              <div key={i} className="flex items-center gap-1 h-3">
                <span className="text-[8px]" style={{ color: l.color, fontFamily: 'var(--font-space-grotesk)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between text-[8px] text-[#3a4a4c]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <span>sparse</span>
          <span>dense →</span>
        </div>
      </div>

      {/* ── Bottom summary bar ── */}
      <div className="border-t border-white/8 bg-black/40 px-5 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {[
            { label: 'Core', value: 'Workflow orchestrator — all layers converge here' },
            { label: 'Nodes', value: 'Context · Memory · Harness · MCP · CLI · Runs' },
            { label: 'Signal', value: 'Data flows continuously — each packet is a real transfer' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[11px]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="font-bold uppercase tracking-[0.15em] text-cyan-400">{item.label}</span>
              <span className="text-[#8ea1a5]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade into background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[48px] h-16 bg-gradient-to-t from-[#0b0d10] to-transparent" />
    </div>
  )
}
