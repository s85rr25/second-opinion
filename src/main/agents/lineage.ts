import type { LineageOutput, LineageNode, LineageEdge } from '@shared/types'
import { callClaude } from './claude'
import { LINEAGE_EXTRACT_CLAIMS, LINEAGE_TRACE_CLAIM } from './prompts'

interface ClaimExtractionResult {
  claims: string[]
}

interface TraceSource {
  id: string
  url: string
  title: string
  publisher: string
  date: string
  cites: string[]
}

interface TraceResult {
  sources: TraceSource[]
  root_candidate_ids: string[]
}

export async function runLineageAgent(articleText: string): Promise<LineageOutput> {
  // Step 1: Extract claims (no web search)
  const { claims } = await callClaude<ClaimExtractionResult>({
    systemPrompt: LINEAGE_EXTRACT_CLAIMS,
    userMessage: `Article:\n<<<\n${articleText}\n>>>`,
    temperature: 0.3,
    maxTokens: 500
  })

  // Step 2: Trace each claim in parallel (with web search)
  const traceResults = await Promise.all(
    claims.slice(0, 3).map((claim) =>
      callClaude<TraceResult>({
        systemPrompt: LINEAGE_TRACE_CLAIM,
        userMessage: `Claim:\n${claim}`,
        temperature: 0.3,
        maxTokens: 1000,
        enableWebSearch: true,
        webSearchMaxUses: 5
      })
    )
  )

  // Step 3: Consolidate in code (not Claude)
  const nodeMap = new Map<string, LineageNode>()
  const edges: LineageEdge[] = []
  const rootIds = new Set<string>()
  let nodeCounter = 0

  // Map from per-claim source IDs to global IDs (dedup by URL)
  const urlToGlobalId = new Map<string, string>()

  for (const traceResult of traceResults) {
    const localToGlobal = new Map<string, string>()

    for (const source of traceResult.sources) {
      let globalId = urlToGlobalId.get(source.url)
      if (!globalId) {
        globalId = `n${++nodeCounter}`
        urlToGlobalId.set(source.url, globalId)
        nodeMap.set(globalId, {
          id: globalId,
          url: source.url,
          title: source.title,
          publisher: source.publisher,
          date: source.date,
          is_root: false
        })
      }
      localToGlobal.set(source.id, globalId)
    }

    // Build edges
    for (const source of traceResult.sources) {
      const fromId = localToGlobal.get(source.id)
      if (!fromId) continue
      for (const citedLocalId of source.cites) {
        const toId = localToGlobal.get(citedLocalId)
        if (toId && fromId !== toId) {
          const edgeKey = `${fromId}->${toId}`
          if (!edges.some((e) => `${e.from}->${e.to}` === edgeKey)) {
            edges.push({ from: fromId, to: toId, relationship: 'cites' })
          }
        }
      }
    }

    // Mark roots
    for (const rootLocalId of traceResult.root_candidate_ids) {
      const globalId = localToGlobal.get(rootLocalId)
      if (globalId) rootIds.add(globalId)
    }
  }

  // If no roots identified from Claude, find nodes with no outgoing citations (they cite nobody)
  if (rootIds.size === 0) {
    const nodesWithOutgoing = new Set(edges.map((e) => e.from))
    for (const [id] of nodeMap) {
      if (!nodesWithOutgoing.has(id)) {
        rootIds.add(id)
      }
    }
  }

  // Mark root nodes
  for (const rootId of rootIds) {
    const node = nodeMap.get(rootId)
    if (node) node.is_root = true
  }

  const nodes = Array.from(nodeMap.values())
  const rootSources = Array.from(rootIds)

  // Calculate confidence based on graph properties
  const independentRoots = rootSources.length
  const confidence = Math.min(
    0.95,
    independentRoots > 1 ? 0.5 + independentRoots * 0.15 : 0.3 + nodes.length * 0.05
  )

  const summary =
    independentRoots <= 1
      ? `Single root source; ${nodes.length} sources in chain`
      : `${independentRoots} independent roots across ${nodes.length} sources`

  return {
    agent: 'lineage',
    summary,
    claims,
    nodes,
    edges,
    root_sources: rootSources,
    confidence: Math.round(confidence * 100) / 100,
    notes: summary
  }
}
