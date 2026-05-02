'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line, OrbitControls, Sparkles, Text } from '@react-three/drei'
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
            <Text
              position={[0, -0.42, 0]}
              fontSize={0.16}
              color="#d8e4e7"
              anchorX="center"
              anchorY="middle"
            >
              {node.title}
            </Text>
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

export default function ArchitectureScene() {
  return (
    <div className="relative h-[520px] w-full overflow-hidden border border-white/8 bg-[#0b0d10] md:h-[580px]">
      <Canvas camera={{ position: [0, 0, 7], fov: 42 }}>
        <SceneContent />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-10 top-8 h-px bg-[linear-gradient(90deg,transparent,rgba(0,219,233,0.7),transparent)] opacity-70" />
      <div className="pointer-events-none absolute left-8 top-8 border border-cyan-400/15 bg-black/40 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-cyan-300">
        Neural memory mesh
      </div>
      <div className="pointer-events-none absolute right-8 top-8 border border-white/10 bg-black/40 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#dbe7ea]">
        urls become linked topic memory
      </div>
      <div className="pointer-events-none absolute left-8 bottom-8 max-w-[18rem] border border-white/10 bg-black/45 px-4 py-3 text-[11px] leading-5 text-[#c8d4d7]">
        Each source Beacon sees becomes another node in the second-brain graph. Repeated runs strengthen the mesh instead of starting over.
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0b0d10] to-transparent" />
    </div>
  )
}
