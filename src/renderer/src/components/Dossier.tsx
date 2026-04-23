import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RunResult } from '@shared/types'

function AgentSection({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-700/50 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 px-1 text-xs text-gray-400 hover:text-gray-200"
      >
        <span>{title}</span>
        <span className="text-[10px]">{open ? '▼' : '▶'}</span>
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
                <AgentSection title="The Lineage Agent found...">
                  <p className="mb-1">
                    <strong>Claims traced:</strong> {result.lineage.claims.join('; ')}
                  </p>
                  <p className="mb-1">
                    <strong>Sources found:</strong> {result.lineage.nodes.length} ({result.lineage.root_sources.length} root)
                  </p>
                  <p>{result.lineage.notes}</p>
                </AgentSection>
              )}

              {result.steelman && (
                <AgentSection title="The Steelman Agent found...">
                  <p className="mb-1">
                    <strong>Thesis:</strong> {result.steelman.thesis}
                  </p>
                  {result.steelman.counter_evidence.map((ce, i) => (
                    <div key={i} className="mb-1 pl-2 border-l border-gray-600">
                      <span className={`font-medium ${ce.strength === 'strong' ? 'text-red-400' : ce.strength === 'moderate' ? 'text-yellow-400' : 'text-gray-400'}`}>
                        [{ce.strength}]
                      </span>{' '}
                      {ce.claim}
                      <br />
                      <span className="text-gray-500">{ce.reasoning}</span>
                    </div>
                  ))}
                  <p>{result.steelman.notes}</p>
                </AgentSection>
              )}

              {result.funding && (
                <AgentSection title="The Funding Agent found...">
                  {result.funding.funders.map((f, i) => (
                    <p key={i} className="mb-1">
                      <strong>{f.entity}:</strong> {f.relationship}
                      {f.notes && <span className="text-gray-500"> — {f.notes}</span>}
                    </p>
                  ))}
                  {result.funding.quoted_experts.map((e, i) => (
                    <p key={i} className="mb-1">
                      <strong>{e.name}</strong> ({e.affiliation}): {e.disclosed_conflicts}
                    </p>
                  ))}
                  <p className="text-gray-500 italic">{result.funding.notes}</p>
                </AgentSection>
              )}

              {result.track_record && (
                <AgentSection title="The Track Record Agent found...">
                  <p className="mb-1">
                    <strong>Author:</strong> {result.track_record.author} ({result.track_record.publication})
                  </p>
                  {result.track_record.prior_claims.map((c, i) => (
                    <div key={i} className="mb-1 pl-2 border-l border-gray-600">
                      <span className={c.aged_well ? 'text-green-400' : 'text-red-400'}>
                        {c.aged_well ? '✓' : '✗'}
                      </span>{' '}
                      {c.claim} <span className="text-gray-500">({c.date})</span>
                      <br />
                      <span className="text-gray-500">{c.notes}</span>
                    </div>
                  ))}
                  <p className="text-gray-500 italic">{result.track_record.notes}</p>
                </AgentSection>
              )}

              {result.synthesis.caveats.length > 0 && (
                <AgentSection title="Caveats">
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
