import { motion } from 'framer-motion'
import type { AgentName } from '@shared/types'

const AGENT_LABELS: Record<AgentName, string> = {
  lineage: 'Lineage',
  steelman: 'Steelman',
  funding: 'Funding',
  track_record: 'Track Record',
  synthesis: 'Synthesis'
}

interface DissentItem {
  between: [AgentName, AgentName]
  disagreement: string
}

export function DissentPanel({ dissent }: { dissent: DissentItem[] }): React.JSX.Element {
  if (dissent.length === 0) return <></>

  return (
    <motion.div
      className="rounded-lg bg-amber-900/30 border border-amber-600/40 p-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-4 h-4 text-amber-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
          Agents Disagree
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {dissent.map((item, i) => (
          <div key={i} className="text-xs text-amber-200/80 leading-relaxed">
            <span className="font-medium text-amber-300">
              {AGENT_LABELS[item.between[0]]} vs {AGENT_LABELS[item.between[1]]}:
            </span>{' '}
            {item.disagreement}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
