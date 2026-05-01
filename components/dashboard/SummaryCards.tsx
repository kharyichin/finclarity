import { getCategoryIcon } from '@/lib/utils/categories'
import type { SummaryCards as SummaryCardsType } from '@/types'

interface SummaryCardsProps {
  data: SummaryCardsType | null
  hasComparison: boolean
  creditCardOnly?: boolean
}

function fmt(amount: number) {
  return `SGD ${amount.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function NumberCard({
  icon,
  label,
  value,
  sub,
  accent = 'bg-white',
  iconClassName,
}: {
  icon: string
  label: string
  value: string
  sub?: string
  accent?: string
  iconClassName?: string
}) {
  return (
    <div className={`rounded-2xl border border-stone-100 ${accent} p-5 flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        <span className={`text-base${iconClassName ? ` ${iconClassName}` : ''}`}>{icon}</span>
        <p className="text-xs text-stone-500 font-medium">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-stone-800 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-stone-400 leading-snug">{sub}</p>}
    </div>
  )
}

function TextCard({
  icon,
  label,
  value,
  accent = 'bg-white',
}: {
  icon: string
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className={`rounded-2xl border border-stone-100 ${accent} p-5 flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <p className="text-xs text-stone-500 font-medium">{label}</p>
      </div>
      <p className="text-sm text-stone-700 leading-relaxed">{value}</p>
    </div>
  )
}

export function SummaryCards({ data, hasComparison, creditCardOnly }: SummaryCardsProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-stone-100 bg-white p-5 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 bg-stone-100 rounded-full" />
              <div className="h-3 w-16 bg-stone-100 rounded" />
            </div>
            <div className="h-7 w-28 bg-stone-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberCard icon="💸" label="Total spent" value={fmt(data.spent)} />

      {creditCardOnly ? (
        <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base animate-sway">🌱</span>
            <p className="text-xs text-stone-500 font-medium">Total saved</p>
          </div>
          <p className="text-sm text-stone-400 leading-snug">Add your bank statement to see savings</p>
        </div>
      ) : (
        <NumberCard
          icon="🌱"
          label="Total saved"
          value={fmt(data.saved)}
          sub={!hasComparison ? 'Upload a past month to compare' : undefined}
          accent="bg-green-50"
          iconClassName="animate-sway"
        />
      )}

      <div className="rounded-2xl border border-stone-100 bg-white p-5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🏷️</span>
          <p className="text-xs text-stone-500 font-medium">Biggest category</p>
        </div>
        <div className="flex items-center gap-2.5 mt-0.5">
          <span className="text-2xl">{getCategoryIcon(data.top_category)}</span>
          <p className="text-xl font-bold text-stone-800 leading-tight">{data.top_category}</p>
        </div>
      </div>
      <TextCard icon="👀" label="Watch out" value={data.watchout} accent="bg-amber-50" />
    </div>
  )
}
