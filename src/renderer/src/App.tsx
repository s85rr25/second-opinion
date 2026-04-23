import { useEffect } from 'react'
import { useStore } from './store'
import { Panel } from './components/Panel'
import { AgentStatusDisplay } from './components/AgentStatus'
import { VerdictBadge } from './components/VerdictBadge'
import { LineageGraph } from './components/LineageGraph'
import { DissentPanel } from './components/DissentPanel'
import { Dossier } from './components/Dossier'
import { EthicsFooter } from './components/EthicsFooter'
import type { AgentProgressEvent, RunResult } from '@shared/types'

function App(): React.JSX.Element {
  const { phase, agentStates, result, errorMessage, startAnalysis, handleAgentProgress, handleComplete, handleError, reset } =
    useStore()

  useEffect(() => {
    const api = window.api

    api.onAgentProgress((event: AgentProgressEvent) => {
      handleAgentProgress(event)
    })

    api.onAnalysisComplete((res: RunResult) => {
      handleComplete(res)
    })

    api.onAnalysisError((error: string) => {
      handleError(error)
    })

    api.onTriggerFromHotkey(() => {
      startAnalysis()
      api.triggerAnalysis()
    })

    api.onTriggerClipboard((text: string) => {
      startAnalysis()
      api.triggerClipboardAnalysis(text)
    })

    return () => {
      api.removeAllListeners('agent:progress')
      api.removeAllListeners('analysis:complete')
      api.removeAllListeners('analysis:error')
      api.removeAllListeners('analysis:trigger-from-hotkey')
      api.removeAllListeners('analysis:trigger-clipboard')
    }
  }, [])

  return (
    <Panel>
      {phase === 'idle' && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 px-6">
          <div className="text-2xl font-light">Second Opinion</div>
          <div className="text-sm text-center text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">Cmd+Shift+S</kbd> to
            analyze what's on screen
          </div>
          <div className="text-xs text-gray-600 mt-2">
            or <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs font-mono">Cmd+Shift+V</kbd> to analyze clipboard text
          </div>
        </div>
      )}

      {(phase === 'analyzing' || phase === 'complete') && (
        <div className="flex flex-col gap-3 p-4 overflow-y-auto h-full">
          <AgentStatusDisplay agentStates={agentStates} />

          {result?.synthesis && (
            <>
              <VerdictBadge synthesis={result.synthesis} />

              {result.lineage && <LineageGraph lineage={result.lineage} />}

              {result.synthesis.dissent.length > 0 && (
                <DissentPanel dissent={result.synthesis.dissent} />
              )}

              <Dossier result={result} />
            </>
          )}

          {phase === 'complete' && result && (
            <div className="text-xs text-gray-500 text-center">
              Analysis completed in {(result.duration_ms / 1000).toFixed(1)}s
            </div>
          )}

          <EthicsFooter />
        </div>
      )}

      {phase === 'error' && (
        <div className="flex flex-col items-center justify-center h-full px-6 gap-3">
          <div className="text-red-400 text-sm text-center">{errorMessage}</div>
          <button
            onClick={reset}
            className="text-xs text-gray-400 hover:text-white px-3 py-1 rounded border border-gray-600"
          >
            Try Again
          </button>
          <EthicsFooter />
        </div>
      )}
    </Panel>
  )
}

export default App
