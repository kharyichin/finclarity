import type { Nudge } from '@/types'

interface NudgesSectionProps {
  nudges: Nudge[] | null
}

export function NudgesSection({ nudges }: NudgesSectionProps) {
  if (!nudges || nudges.length === 0) return null

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-4">What to Watch For Next Month</p>
      <ul className="space-y-3">
        {nudges.map((nudge, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="mt-0.5 text-green-500">→</span>
            <p className="text-sm text-stone-600 leading-relaxed">{nudge.message}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}