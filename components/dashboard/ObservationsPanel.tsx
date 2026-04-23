import { CollapsiblePanel } from '@/components/ui/CollapsiblePanel'
import type { Observation } from '@/types'

interface ObservationsPanelProps {
  observations: Observation[] | null
  hasMultipleMonths: boolean
}

const OBS_ICONS: Record<string, string> = {
  new_charge: '🆕',
  missing_charge: '❓',
  amount_changed: '📈',
  spending_spike: '⚡',
}

export function ObservationsPanel({ observations, hasMultipleMonths }: ObservationsPanelProps) {
  if (!hasMultipleMonths) return null
  if (!observations || observations.length === 0) return null

  return (
    <CollapsiblePanel title="Observations">
      <div className="space-y-3 pt-1">
        {observations.map((obs, i) => (
          <div key={i} className="flex gap-3 items-start rounded-xl bg-stone-50 border border-stone-100 px-4 py-3">
            <span className="text-base shrink-0 mt-0.5">{OBS_ICONS[obs.type] ?? '◦'}</span>
            <p className="text-sm text-stone-600 leading-relaxed">{obs.message}</p>
          </div>
        ))}
      </div>
    </CollapsiblePanel>
  )
}
