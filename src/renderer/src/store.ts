import { create } from 'zustand'
import type {
  AgentName,
  AgentStatus,
  AgentProgressEvent,
  RunResult,
  LineageOutput,
  SteelmanOutput,
  FundingOutput,
  TrackRecordOutput,
  SynthesisOutput
} from '@shared/types'

type Phase = 'idle' | 'analyzing' | 'complete' | 'error'

interface AgentState {
  status: AgentStatus
  message?: string
  output?: LineageOutput | SteelmanOutput | FundingOutput | TrackRecordOutput | SynthesisOutput
  error?: string
}

interface AppState {
  phase: Phase
  agentStates: Record<AgentName, AgentState>
  result: RunResult | null
  errorMessage: string | null

  startAnalysis: () => void
  handleAgentProgress: (event: AgentProgressEvent) => void
  handleComplete: (result: RunResult) => void
  handleError: (error: string) => void
  reset: () => void
}

const initialAgentStates: Record<AgentName, AgentState> = {
  lineage: { status: 'pending' },
  steelman: { status: 'pending' },
  funding: { status: 'pending' },
  track_record: { status: 'pending' },
  synthesis: { status: 'pending' }
}

export const useStore = create<AppState>((set) => ({
  phase: 'idle',
  agentStates: { ...initialAgentStates },
  result: null,
  errorMessage: null,

  startAnalysis: () =>
    set({
      phase: 'analyzing',
      agentStates: {
        lineage: { status: 'pending' },
        steelman: { status: 'pending' },
        funding: { status: 'pending' },
        track_record: { status: 'pending' },
        synthesis: { status: 'pending' }
      },
      result: null,
      errorMessage: null
    }),

  handleAgentProgress: (event: AgentProgressEvent) =>
    set((state) => ({
      agentStates: {
        ...state.agentStates,
        [event.agent]: {
          status: event.status,
          message: event.message,
          output: event.output,
          error: event.error
        }
      }
    })),

  handleComplete: (result: RunResult) =>
    set({
      phase: 'complete',
      result
    }),

  handleError: (error: string) =>
    set({
      phase: 'error',
      errorMessage: error
    }),

  reset: () =>
    set({
      phase: 'idle',
      agentStates: { ...initialAgentStates },
      result: null,
      errorMessage: null
    })
}))
