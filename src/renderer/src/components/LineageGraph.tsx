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

type LinkEndpoint = string | { id: string }

interface GraphLink {
  source: LinkEndpoint
  target: LinkEndpoint
  relationship: string
}

function endpointId(endpoint: LinkEndpoint): string {
  return typeof endpoint === 'object' ? endpoint.id : endpoint
}

function linkKey(link: GraphLink): string {
  return `${endpointId(link.source)}->${endpointId(link.target)}`
}

const EDGE_FADE_MS = 450

export function LineageGraph({ lineage }: { lineage: LineageOutput }): React.JSX.Element {
  const [visibleNodeCount, setVisibleNodeCount] = useState(0)
  const [visibleEdgeCount, setVisibleEdgeCount] = useState(0)
  const edgeRevealTimesRef = useRef<Map<string, number>>(new Map())
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

  // Phase 1: stagger nodes in
  useEffect(() => {
    if (visibleNodeCount >= allNodes.length) return
    const timer = setTimeout(
      () => setVisibleNodeCount((c) => Math.min(c + 1, allNodes.length)),
      300
    )
    return () => clearTimeout(timer)
  }, [visibleNodeCount, allNodes.length])

  // Phase 2: once all nodes are visible, stagger edges in (with brief pause before the first)
  useEffect(() => {
    if (visibleNodeCount < allNodes.length) return
    if (visibleEdgeCount >= allLinks.length) return
    const delay = visibleEdgeCount === 0 ? 500 : 180
    const timer = setTimeout(() => {
      const nextIndex = visibleEdgeCount
      const newEdge = allLinks[nextIndex]
      if (newEdge) {
        edgeRevealTimesRef.current.set(linkKey(newEdge), Date.now())
      }
      setVisibleEdgeCount((c) => Math.min(c + 1, allLinks.length))
    }, delay)
    return () => clearTimeout(timer)
  }, [visibleNodeCount, visibleEdgeCount, allNodes.length, allLinks.length])

  const visibleNodes = allNodes.slice(0, visibleNodeCount)
  const visibleLinks = allLinks.slice(0, visibleEdgeCount)

  const nodeCanvasObject = useCallback(
    (
      node: GraphNode & { x?: number; y?: number },
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
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

      // Publisher label — divide by globalScale so size stays constant on screen
      const fontSize = 10 / globalScale
      ctx.font = `${fontSize}px -apple-system, sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(node.publisher, x, y + radius + 2)
    },
    []
  )

  const linkColorFn = useCallback((link: GraphLink): string => {
    const revealedAt = edgeRevealTimesRef.current.get(linkKey(link))
    if (revealedAt === undefined) return 'rgba(147, 197, 253, 0)'
    const elapsed = Date.now() - revealedAt
    const t = Math.min(1, elapsed / EDGE_FADE_MS)
    // ease-out
    const eased = 1 - Math.pow(1 - t, 2)
    return `rgba(147, 197, 253, ${eased * 0.5})`
  }, [])

  const linkArrowLengthFn = useCallback((link: GraphLink): number => {
    const revealedAt = edgeRevealTimesRef.current.get(linkKey(link))
    if (revealedAt === undefined) return 0
    const elapsed = Date.now() - revealedAt
    const t = Math.min(1, elapsed / EDGE_FADE_MS)
    return 3 * t
  }, [])

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
        nodeCanvasObject={
          nodeCanvasObject as unknown as (
            node: object,
            ctx: CanvasRenderingContext2D,
            globalScale: number
          ) => void
        }
        linkColor={linkColorFn as unknown as (link: object) => string}
        linkWidth={1}
        linkDirectionalArrowLength={
          linkArrowLengthFn as unknown as (link: object) => number
        }
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
