import type { ReactNode } from 'react'

export function Panel({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <div className="w-full h-full rounded-xl bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col">
      <div className="drag-region h-6 flex items-center justify-center shrink-0">
        <div className="w-8 h-1 rounded-full bg-gray-600" />
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
