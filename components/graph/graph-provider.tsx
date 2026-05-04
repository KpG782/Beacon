'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { GraphData, GraphEngineType } from '@/lib/graph/types'

function GraphSkeleton() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden border border-white/10 bg-[#0b0d10]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,219,233,0.14),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_68%,transparent_100%)]" />
      <div className="relative mb-5 h-20 w-20">
        <div className="absolute inset-0 animate-ping border border-cyan-400/35" />
        <div className="absolute inset-2 animate-spin border border-cyan-300/60" style={{ animationDuration: '2.6s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined animate-pulse text-[22px] text-cyan-300">hub</span>
        </div>
      </div>
      <div className="z-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-300" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        <span className="h-1.5 w-1.5 animate-pulse bg-cyan-300" />
        Loading graph engine
      </div>
    </div>
  )
}

const ThreeJSAdapter = dynamic(() => import('./engines/threejs-adapter'), {
  ssr: false,
  loading: () => <GraphSkeleton />,
})
const SigmajsAdapter = dynamic(() => import('./engines/sigmajs-adapter'), {
  ssr: false,
  loading: () => <GraphSkeleton />,
})
const CytoscapeAdapter = dynamic(() => import('./engines/cytoscape-adapter'), {
  ssr: false,
  loading: () => <GraphSkeleton />,
})

interface GraphProviderProps {
  data: GraphData
  defaultEngine?: GraphEngineType
  className?: string
  showToggle?: boolean
}

export function GraphProvider({
  data,
  defaultEngine = 'sigmajs',
  className = 'w-full h-[500px]',
  showToggle = true,
}: GraphProviderProps) {
  const [engine, setEngine] = useState<GraphEngineType>(defaultEngine)

  return (
    <div className={`group relative ${className}`}>
      {engine === 'threejs' && <ThreeJSAdapter data={data} />}
      {engine === 'sigmajs' && <SigmajsAdapter data={data} />}
      {engine === 'cytoscape' && <CytoscapeAdapter data={data} />}

      {showToggle && (
        <div className="absolute bottom-4 right-4 z-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-1 border border-white/10 bg-black/80 p-1.5 backdrop-blur-md">
            <Settings2 size={12} className="mx-1 text-white/50" />
            <button
              onClick={() => setEngine('threejs')}
              className={`px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
                engine === 'threejs' ? 'bg-cyan-400/20 text-cyan-300' : 'text-white/45 hover:text-white/80'
              }`}
              style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
            >
              THREE.JS
            </button>
            <button
              onClick={() => setEngine('sigmajs')}
              className={`px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
                engine === 'sigmajs' ? 'bg-cyan-400/20 text-cyan-300' : 'text-white/45 hover:text-white/80'
              }`}
              style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
            >
              SIGMA.JS
            </button>
            <button
              onClick={() => setEngine('cytoscape')}
              className={`px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
                engine === 'cytoscape' ? 'bg-cyan-400/20 text-cyan-300' : 'text-white/45 hover:text-white/80'
              }`}
              style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
            >
              CYTOSCAPE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
