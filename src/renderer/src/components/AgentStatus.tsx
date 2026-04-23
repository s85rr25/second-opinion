import { motion } from 'framer-motion'
import type { AgentName, AgentStatus } from '@shared/types'

const AGENT_LABELS: Record<AgentName, string> = {
  lineage: 'Lineage',
  steelman: 'Steelman',
  funding: 'Funding',
  track_record: 'Track Record',
  synthesis: 'Synthesis'
}

interface AgentState {
  status: AgentStatus
  message?: string
  error?: string
}

function StatusIcon({ status }: { status: AgentStatus }): React.JSX.Element {
  switch (status) {
    case 'pending':
      return <div className="w-3 h-3 rounded-full bg-gray-600" />
    case 'running':
      return (
        <motion.div
          className="w-3 h-3 rounded-full bg-blue-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )
    case 'completed':
      return (
        <motion.div
          className="w-3 h-3 rounded-full bg-green-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        />
      )
    case 'failed':
      return (
        <motion.div
          className="w-3 h-3 rounded-full bg-red-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )
  }
}

export function AgentStatusDisplay({
  agentStates
}: {
  agentStates: Record<AgentName, AgentState>
}): React.JSX.Element {
  const agents: AgentName[] = ['lineage', 'steelman', 'funding', 'track_record']

  return (
    <div className="grid grid-cols-2 gap-2">
      {agents.map((agent) => {
        const state = agentStates[agent]
        return (
          <motion.div
            key={agent}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: agents.indexOf(agent) * 0.1 }}
          >
            <StatusIcon status={state.status} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-gray-300 truncate">
                {AGENT_LABELS[agent]}
              </span>
              {state.message && (
                <span className="text-[10px] text-gray-500 truncate">{state.message}</span>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
