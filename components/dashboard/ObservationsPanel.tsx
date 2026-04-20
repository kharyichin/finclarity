import { CollapsiblePanel } from '@/components/ui/CollapsiblePanel'
import type { Observation } from '@/types'

interface ObservationsPanelProps {
  observations: Observation[] | null
  hasMultipleMonths: boolean
}

export function ObservationsPanel({ observations, hasMultipleMonths }: ObservationsPanelProps) {
  if (!hasMultipleMonths) return null
  if (!observations || observations.length === 0) return null

  return (
    <CollapsiblePanel title="Monthly Observations">
      <ul className="space-y-3 pt-1">
        {observations.map((obs, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="mt-0.5 text-amber-500">◦</span>
            <p className="text-sm text-stone-600 leading-relaxed">{obs.message}</p>
          </li>
        ))}
      </ul>
    </CollapsiblePanel>
  )
}
