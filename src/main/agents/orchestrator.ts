import { BrowserWindow } from 'electron'
import type {
  AgentName,
  LineageOutput,
  SteelmanOutput,
  FundingOutput,
  TrackRecordOutput,
  RunResult
} from '@shared/types'
import { runLineageAgent } from './lineage'
import { runSteelmanAgent } from './steelman'
import { runFundingAgent } from './funding'
import { runTrackRecordAgent } from './track_record'
import { runSynthesisAgent } from './synthesis'

function runWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  agentName: string
): Promise<T | null> {
  return Promise.race([
    fn(),
    new Promise<null>((resolve) =>
      setTimeout(() => {
        console.warn(`${agentName} timed out after ${timeoutMs}ms`)
        resolve(null)
      }, timeoutMs)
    )
  ])
}

function emitProgress(
  panelWindow: BrowserWindow,
  agent: AgentName,
  status: 'pending' | 'running' | 'completed' | 'failed',
  message?: string,
  output?: unknown,
  error?: string
): void {
  panelWindow.webContents.send('agent:progress', {
    agent,
    status,
    message,
    output,
    error
  })
}

export async function runAnalysis(panelWindow: BrowserWindow, articleText: string): Promise<void> {
  const startTime = Date.now()

  // Signal all agents as pending
  const agents: AgentName[] = ['lineage', 'steelman', 'funding', 'track_record']
  for (const agent of agents) {
    emitProgress(panelWindow, agent, 'pending', 'Waiting...')
  }

  // Run all 4 specialist agents in parallel
  const [lineage, steelman, funding, trackRecord] = await Promise.all([
    (async () => {
      emitProgress(panelWindow, 'lineage', 'running', 'Tracing citation lineage...')
      try {
        const result = await runWithTimeout(() => runLineageAgent(articleText), 45000, 'lineage')
        if (result) {
          emitProgress(panelWindow, 'lineage', 'completed', 'Lineage traced', result)
        } else {
          emitProgress(panelWindow, 'lineage', 'failed', 'Timed out')
        }
        return result
      } catch (e) {
        emitProgress(panelWindow, 'lineage', 'failed', undefined, undefined, String(e))
        console.error('Lineage agent error:', e)
        return null
      }
    })(),
    (async () => {
      emitProgress(panelWindow, 'steelman', 'running', 'Finding counter-evidence...')
      try {
        const result = await runWithTimeout(
          () => runSteelmanAgent(articleText),
          35000,
          'steelman'
        )
        if (result) {
          emitProgress(panelWindow, 'steelman', 'completed', 'Counter-evidence found', result)
        } else {
          emitProgress(panelWindow, 'steelman', 'failed', 'Timed out')
        }
        return result
      } catch (e) {
        emitProgress(panelWindow, 'steelman', 'failed', undefined, undefined, String(e))
        console.error('Steelman agent error:', e)
        return null
      }
    })(),
    (async () => {
      emitProgress(panelWindow, 'funding', 'running', 'Checking funding & incentives...')
      try {
        const result = await runWithTimeout(() => runFundingAgent(articleText), 25000, 'funding')
        if (result) {
          emitProgress(panelWindow, 'funding', 'completed', 'Funding analyzed', result)
        } else {
          emitProgress(panelWindow, 'funding', 'failed', 'Timed out')
        }
        return result
      } catch (e) {
        emitProgress(panelWindow, 'funding', 'failed', undefined, undefined, String(e))
        console.error('Funding agent error:', e)
        return null
      }
    })(),
    (async () => {
      emitProgress(panelWindow, 'track_record', 'running', 'Checking author track record...')
      try {
        const result = await runWithTimeout(
          () => runTrackRecordAgent(articleText),
          25000,
          'track_record'
        )
        if (result) {
          emitProgress(panelWindow, 'track_record', 'completed', 'Track record assessed', result)
        } else {
          emitProgress(panelWindow, 'track_record', 'failed', 'Timed out')
        }
        return result
      } catch (e) {
        emitProgress(panelWindow, 'track_record', 'failed', undefined, undefined, String(e))
        console.error('Track record agent error:', e)
        return null
      }
    })()
  ])

  // Run synthesis
  emitProgress(panelWindow, 'synthesis', 'running', 'Synthesizing findings...')
  try {
    const synthesis = await runSynthesisAgent(
      lineage as LineageOutput | null,
      steelman as SteelmanOutput | null,
      funding as FundingOutput | null,
      trackRecord as TrackRecordOutput | null
    )

    emitProgress(panelWindow, 'synthesis', 'completed', 'Analysis complete', synthesis)

    const result: RunResult = {
      article_text: articleText,
      lineage: lineage as LineageOutput | null,
      steelman: steelman as SteelmanOutput | null,
      funding: funding as FundingOutput | null,
      track_record: trackRecord as TrackRecordOutput | null,
      synthesis,
      duration_ms: Date.now() - startTime
    }

    panelWindow.webContents.send('analysis:complete', result)
  } catch (e) {
    emitProgress(panelWindow, 'synthesis', 'failed', undefined, undefined, String(e))
    console.error('Synthesis agent error:', e)
    panelWindow.webContents.send('analysis:error', String(e))
  }
}
