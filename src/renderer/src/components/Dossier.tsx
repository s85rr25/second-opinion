import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RunResult } from '@shared/types'

function AgentSection({
  title,
  summary,
  children
}: {
  title: string
  summary: string
  children: React.ReactNode
}): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-700/50 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between py-2 px-1 text-xs text-gray-400 hover:text-gray-200"
      >
        <div className="flex flex-col items-start gap-0.5 text-left">
          <span>{title}</span>
          {!open && summary && (
            <span className="text-[11px] text-gray-500 line-clamp-1">{summary}</span>
          )}
        </div>
        <span className="text-[10px] shrink-0 mt-0.5">{open ? '▼' : '▶'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-2 px-1 text-xs text-gray-400 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Dossier({ result }: { result: RunResult }): React.JSX.Element {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-center text-xs text-gray-500 hover:text-gray-300 py-2"
      >
        {expanded ? 'Hide Full Dossier' : 'View Full Dossier'}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="rounded-lg bg-gray-800/50 border border-gray-700/50 overflow-hidden"
          >
            <div className="p-3">
              {result.lineage && (
                <AgentSection
                  title="Lineage"
                  summary={result.lineage.summary}
                >
                  <p className="mb-1">
                    <strong>Claims:</strong> {result.lineage.claims.join('; ')}
                  </p>
                  <p>
                    <strong>Sources:</strong> {result.lineage.nodes.length} ({result.lineage.root_sources.length} root)
                  </p>
                </AgentSection>
              )}

              {result.steelman && (
                <AgentSection
                  title="Steelman"
                  summary={result.steelman.summary}
                >
                  <p className="mb-1">
                    <strong>Thesis:</strong> {result.steelman.thesis}
                  </p>
                  {result.steelman.counter_evidence.map((ce, i) => (
                    <div key={i} className="mb-1 pl-2 border-l border-gray-600">
                      <span className={`font-medium ${ce.strength === 'strong' ? 'text-red-400' : ce.strength === 'moderate' ? 'text-yellow-400' : 'text-gray-400'}`}>
                        [{ce.strength}]
                      </span>{' '}
                      {ce.claim}
                    </div>
                  ))}
                </AgentSection>
              )}

              {result.funding && (
                <AgentSection
                  title="Funding"
                  summary={result.funding.summary}
                >
                  {result.funding.funders.map((f, i) => (
                    <p key={i} className="mb-1">
                      <strong>{f.entity}:</strong> {f.relationship}
                    </p>
                  ))}
                  {result.funding.quoted_experts.map((e, i) => (
                    <p key={i} className="mb-1">
                      <strong>{e.name}</strong> ({e.affiliation}): {e.disclosed_conflicts}
                    </p>
                  ))}
                </AgentSection>
              )}

              {result.track_record && (
                <AgentSection
                  title="Track Record"
                  summary={result.track_record.summary}
                >
                  {result.track_record.prior_claims.map((c, i) => (
                    <div key={i} className="mb-1 pl-2 border-l border-gray-600">
                      <span className={c.aged_well ? 'text-green-400' : 'text-red-400'}>
                        {c.aged_well ? '✓' : '✗'}
                      </span>{' '}
                      {c.claim} <span className="text-gray-500">({c.date})</span>
                    </div>
                  ))}
                </AgentSection>
              )}

              {result.synthesis.caveats.length > 0 && (
                <AgentSection title="Caveats" summary={result.synthesis.caveats[0]}>
                  <ul className="list-disc pl-4">
                    {result.synthesis.caveats.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </AgentSection>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
