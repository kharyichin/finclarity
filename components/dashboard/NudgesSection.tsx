import type { Nudge } from '@/types'

interface NudgesSectionProps {
  nudges: Nudge[] | null
}

function CalendarWidget({ day, month }: { day: number; month: string }) {
  return (
    <div className="rounded-xl overflow-hidden w-14 shrink-0 shadow-sm border border-stone-100">
      <div className="bg-amber-500 text-white text-center py-1">
        <span className="text-[10px] font-bold tracking-wider">{month}</span>
      </div>
      <div className="bg-white text-center py-2">
        <span className="text-2xl font-black text-stone-800 leading-none">{day}</span>
      </div>
    </div>
  )
}

function RecurringNudge({ nudge }: { nudge: Nudge }) {
  const day   = nudge.predicted_date ? new Date(nudge.predicted_date).getDate() : null
  const month = nudge.predicted_date
    ? new Date(nudge.predicted_date).toLocaleDateString('en-SG', { month: 'short' }).toUpperCase()
    : null

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white border border-stone-100 shadow-sm px-5 py-4">
      {day !== null && month !== null
        ? <CalendarWidget day={day} month={month} />
        : <div className="rounded-xl bg-amber-50 p-3 shrink-0 text-xl">🗓️</div>
      }
      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Heads up</p>
        <p className="text-sm text-stone-700 leading-relaxed">{nudge.message}</p>
      </div>
    </div>
  )
}

function TrendNudge({ nudge }: { nudge: Nudge }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-white border border-green-100 shadow-sm px-5 py-4">
      <div className="rounded-xl bg-green-50 p-3 shrink-0 flex items-center justify-center">
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline
            points="0,18 5,14 10,15 16,8 22,5 28,1"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="28" cy="1" r="2.5" fill="#16a34a" />
        </svg>
      </div>
      <div className="space-y-1 pt-0.5">
        <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider">Momentum</p>
        <p className="text-sm text-stone-700 leading-relaxed">{nudge.message}</p>
      </div>
    </div>
  )
}

function GenericNudge({ nudge }: { nudge: Nudge }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-100 shadow-sm px-5 py-4">
      <p className="text-sm text-stone-700 leading-relaxed">{nudge.message}</p>
    </div>
  )
}

export function NudgesSection({ nudges }: NudgesSectionProps) {
  if (!nudges || nudges.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wide px-1">Next month</p>
      {nudges.map((nudge, i) => {
        if (nudge.pattern === 'recurring') return <RecurringNudge key={i} nudge={nudge} />
        if (nudge.pattern === 'trend')     return <TrendNudge key={i} nudge={nudge} />
        return <GenericNudge key={i} nudge={nudge} />
      })}
    </div>
  )
}
