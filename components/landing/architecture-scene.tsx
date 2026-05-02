'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'

function Core() {
  const group = useRef<Group>(null)
  const shell = useRef<Mesh>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.35
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.08
    }
    if (shell.current) {
      shell.current.rotation.x = state.clock.elapsedTime * 0.2
      shell.current.rotation.z = state.clock.elapsedTime * 0.25
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

function Connector({
  position,
  rotation,
  color,
  length,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
  length: number
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[0.015, 0.015, length, 18]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} transparent opacity={0.55} />
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
        <LayerNode color="#00dbe9" position={[-2.55, 1.25, 0.45]} />
        <LayerNode color="#65f2b5" position={[2.3, 0.1, -0.25]} />
        <LayerNode color="#ffb84e" position={[-0.1, -2.15, 0.25]} scale={0.65} />

        <Connector position={[-1.15, 0.6, 0.2]} rotation={[0, 0, -1.05]} color="#00dbe9" length={2.45} />
        <Connector position={[1.1, 0.05, -0.08]} rotation={[0.1, 0.1, 1.08]} color="#65f2b5" length={2.1} />
        <Connector position={[-0.05, -1.05, 0.12]} rotation={[0.15, 0.05, 0.02]} color="#ffb84e" length={2.05} />

        <mesh rotation={[Math.PI / 2.2, 0, 0]} position={[0, 0, -0.8]}>
          <torusGeometry args={[3.25, 0.035, 20, 120]} />
          <meshStandardMaterial color="#20333a" emissive="#20333a" emissiveIntensity={0.25} />
        </mesh>
      </group>

      <Sparkles count={55} scale={8} size={2} speed={0.45} color="#7de9ff" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
    </>
  )
}

export default function ArchitectureScene() {
  return (
    <div className="relative h-[460px] w-full overflow-hidden border border-white/8 bg-[#0b0d10]">
      <Canvas camera={{ position: [0, 0, 7], fov: 42 }}>
        <SceneContent />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0b0d10] to-transparent" />
    </div>
  )
}
