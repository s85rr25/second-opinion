import type {
  LineageOutput,
  SteelmanOutput,
  FundingOutput,
  TrackRecordOutput,
  SynthesisOutput
} from '@shared/types'
import { callClaude } from './claude'
import { SYNTHESIS_PROMPT } from './prompts'

export async function runSynthesisAgent(
  lineage: LineageOutput | null,
  steelman: SteelmanOutput | null,
  funding: FundingOutput | null,
  trackRecord: TrackRecordOutput | null
): Promise<SynthesisOutput> {
  const dossiers = [
    lineage ? `LINEAGE AGENT:\n${JSON.stringify(lineage, null, 2)}` : 'LINEAGE AGENT: [timed out — no data]',
    steelman ? `STEELMAN AGENT:\n${JSON.stringify(steelman, null, 2)}` : 'STEELMAN AGENT: [timed out — no data]',
    funding ? `FUNDING AGENT:\n${JSON.stringify(funding, null, 2)}` : 'FUNDING AGENT: [timed out — no data]',
    trackRecord ? `TRACK RECORD AGENT:\n${JSON.stringify(trackRecord, null, 2)}` : 'TRACK RECORD AGENT: [timed out — no data]'
  ].join('\n\n---\n\n')

  const result = await callClaude<SynthesisOutput>({
    systemPrompt: SYNTHESIS_PROMPT,
    userMessage: `Dossiers:\n\n${dossiers}`,
    temperature: 0.5,
    maxTokens: 1500
  })

  return result
}
