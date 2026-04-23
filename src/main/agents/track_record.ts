import type { TrackRecordOutput } from '@shared/types'
import { callClaude } from './claude'
import { TRACK_RECORD_PROMPT } from './prompts'

export async function runTrackRecordAgent(articleText: string): Promise<TrackRecordOutput> {
  const result = await callClaude<Omit<TrackRecordOutput, 'agent'>>({
    systemPrompt: TRACK_RECORD_PROMPT,
    userMessage: `Article:\n<<<\n${articleText}\n>>>`,
    temperature: 0.3,
    maxTokens: 1000,
    enableWebSearch: true,
    webSearchMaxUses: 5
  })

  return {
    agent: 'track_record',
    ...result
  }
}
