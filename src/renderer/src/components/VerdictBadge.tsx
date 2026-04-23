import { motion } from 'framer-motion'
import type { SynthesisOutput, BadgeColor } from '@shared/types'

const BADGE_COLORS: Record<BadgeColor, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500'
}

const BADGE_BORDER: Record<BadgeColor, string> = {
  green: 'border-green-500/30',
  yellow: 'border-yellow-500/30',
  red: 'border-red-500/30'
}

export function VerdictBadge({ synthesis }: { synthesis: SynthesisOutput }): React.JSX.Element {
  return (
    <motion.div
      className={`p-4 rounded-lg bg-gray-800/50 border ${BADGE_BORDER[synthesis.badge]}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="flex items-start gap-3">
        <motion.div
          className={`w-5 h-5 rounded-full ${BADGE_COLORS[synthesis.badge]} shrink-0 mt-0.5`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
        />
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-sm font-medium text-gray-200 leading-snug">
            {synthesis.verdict_sentence}
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            {synthesis.badge_reasoning}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-500">
              Confidence: {Math.round(synthesis.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
