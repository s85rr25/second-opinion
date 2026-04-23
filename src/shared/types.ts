export type BadgeColor = 'green' | 'yellow' | 'red'
export type AgentName = 'lineage' | 'steelman' | 'funding' | 'track_record' | 'synthesis'
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface LineageNode {
  id: string
  url: string
  title: string
  publisher: string
  date: string // ISO8601
  is_root: boolean
}

export interface LineageEdge {
  from: string
  to: string
  relationship: 'cites' | 'quotes' | 'paraphrases'
}

export interface LineageOutput {
  agent: 'lineage'
  summary: string
  claims: string[]
  nodes: LineageNode[]
  edges: LineageEdge[]
  root_sources: string[]
  confidence: number
  notes: string
}

export interface SteelmanOutput {
  agent: 'steelman'
  summary: string
  thesis: string
  counter_evidence: Array<{
    claim: string
    source_url: string
    source_title: string
    strength: 'strong' | 'moderate' | 'weak'
    reasoning: string
  }>
  confidence: number
  notes: string
}

export interface FundingOutput {
  agent: 'funding'
  summary: string
  funders: Array<{ entity: string; relationship: string; notes: string }>
  quoted_experts: Array<{ name: string; affiliation: string; disclosed_conflicts: string }>
  confidence: number
  notes: string
}

export interface TrackRecordOutput {
  agent: 'track_record'
  summary: string
  author: string
  publication: string
  prior_claims: Array<{ claim: string; date: string; aged_well: boolean; notes: string }>
  confidence: number
  notes: string
}

export interface SynthesisOutput {
  verdict_sentence: string
  badge: BadgeColor
  badge_reasoning: string
  confidence: number
  dissent: Array<{ between: [AgentName, AgentName]; disagreement: string }>
  caveats: string[]
}

export interface AgentProgressEvent {
  agent: AgentName
  status: AgentStatus
  message?: string
  output?: LineageOutput | SteelmanOutput | FundingOutput | TrackRecordOutput | SynthesisOutput
  error?: string
}

export interface RunResult {
  article_text: string
  lineage: LineageOutput | null
  steelman: SteelmanOutput | null
  funding: FundingOutput | null
  track_record: TrackRecordOutput | null
  synthesis: SynthesisOutput
  duration_ms: number
}
