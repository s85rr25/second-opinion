import { useEffect, useState, useCallback, useRef } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { motion } from 'framer-motion'
import type { LineageOutput } from '@shared/types'

interface GraphNode {
  id: string
  label: string
  is_root: boolean
  publisher: string
  date: string
  url: string
}

interface GraphLink {
  source: string
  target: string
  relationship: string
}

export function LineageGraph({ lineage }: { lineage: LineageOutput }): React.JSX.Element {
  const [visibleNodeCount, setVisibleNodeCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Transform data for react-force-graph-2d
  const allNodes: GraphNode[] = lineage.nodes.map((n) => ({
    id: n.id,
    label: n.title.length > 40 ? n.title.substring(0, 37) + '...' : n.title,
    is_root: n.is_root,
    publisher: n.publisher,
    date: n.date,
    url: n.url
  }))

  const allLinks: GraphLink[] = lineage.edges.map((e) => ({
    source: e.from,
    target: e.to,
    relationship: e.relationship
  }))

  // Staggered node appearance
  useEffect(() => {
    if (visibleNodeCount >= allNodes.length) return
    const timer = setTimeout(
      () => setVisibleNodeCount((c) => Math.min(c + 1, allNodes.length)),
      300
    )
    return () => clearTimeout(timer)
  }, [visibleNodeCount, allNodes.length])

  const visibleNodes = allNodes.slice(0, visibleNodeCount)
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id))
  const visibleLinks = allLinks.filter(
    (l) => visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target)
  )

  const nodeCanvasObject = useCallback(
    (node: GraphNode & { x?: number; y?: number }, ctx: CanvasRenderingContext2D) => {
      const x = node.x || 0
      const y = node.y || 0
      const radius = node.is_root ? 8 : 5

      // Root pulse effect
      if (node.is_root) {
        const pulse = Math.sin(Date.now() / 300) * 0.4 + 0.6
        ctx.beginPath()
        ctx.arc(x, y, radius + 4, 0, 2 * Math.PI)
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.3})`
        ctx.fill()
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = node.is_root ? '#ef4444' : '#60a5fa'
      ctx.fill()
      ctx.strokeStyle = node.is_root ? '#fca5a5' : '#93bbfd'
      ctx.lineWidth = 1
      ctx.stroke()

      // Publisher label
      ctx.font = '3px -apple-system, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.textAlign = 'center'
      ctx.fillText(node.publisher, x, y + radius + 5)
    },
    []
  )

  if (allNodes.length === 0) return <></>

  return (
    <motion.div
      ref={containerRef}
      className="rounded-lg bg-gray-800/50 border border-gray-700/50 overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 200 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-700/50">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          Citation Lineage
        </span>
        <span className="text-[10px] text-gray-500">
          {lineage.root_sources.length} root{lineage.root_sources.length !== 1 ? 's' : ''} ·{' '}
          {lineage.nodes.length} sources
        </span>
      </div>
      <ForceGraph2D
        width={396}
        height={170}
        graphData={{ nodes: visibleNodes, links: visibleLinks }}
        nodeCanvasObject={nodeCanvasObject as unknown as (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => void}
        linkColor={() => 'rgba(255,255,255,0.15)'}
        linkWidth={1}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        cooldownTicks={Infinity}
        d3VelocityDecay={0.3}
        backgroundColor="transparent"
        enableZoomInteraction={false}
        enablePanInteraction={false}
      />
    </motion.div>
  )
}
