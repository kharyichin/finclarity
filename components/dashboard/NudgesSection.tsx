import type { Nudge } from '@/types'

interface NudgesSectionProps {
  nudges: Nudge[] | null
}

export function NudgesSection({ nudges }: NudgesSectionProps) {
  if (!nudges || nudges.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wide px-1">Coming up</p>
      {nudges.map((nudge, i) => (
        <div key={i} className="rounded-2xl border border-green-100 bg-green-50 p-4 flex gap-3 items-start">
          <span className="text-lg shrink-0 mt-0.5">🌿</span>
          <div className="space-y-1">
            <p className="text-sm text-stone-700 leading-relaxed">{nudge.message}</p>
            {nudge.predicted_date && (
              <span className="inline-block rounded-full bg-white border border-green-200 text-green-700 text-xs px-2.5 py-0.5">
                Around {new Date(nudge.predicted_date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
