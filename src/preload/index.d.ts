import type { AgentProgressEvent, RunResult } from '../shared/types'

declare global {
  interface Window {
    api: {
      onAgentProgress: (callback: (event: AgentProgressEvent) => void) => void
      onAnalysisComplete: (callback: (result: RunResult) => void) => void
      onAnalysisError: (callback: (error: string) => void) => void
      onTriggerFromHotkey: (callback: () => void) => void
      onTriggerClipboard: (callback: (text: string) => void) => void
      triggerAnalysis: () => Promise<void>
      triggerClipboardAnalysis: (text: string) => Promise<void>
      removeAllListeners: (channel: string) => void
    }
  }
}
