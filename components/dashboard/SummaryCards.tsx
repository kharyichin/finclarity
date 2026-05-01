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

export function SummaryCards({ data, hasComparison, creditCardOnly }: SummaryCardsProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-stone-100 p-5 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 bg-stone-200 rounded-full" />
              <div className="h-3 w-16 bg-stone-200 rounded" />
            </div>
            <div className="h-7 w-28 bg-stone-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">

      {/* Total Spent — warm peach */}
      <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ backgroundColor: '#FFC28B' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">💸</span>
          <p className="text-xs font-medium text-stone-700">Total spent</p>
        </div>
        <p className="text-2xl font-semibold text-stone-800 tracking-tight">{fmt(data.spent)}</p>
      </div>

      {/* Total Saved — deep navy or locked */}
      {creditCardOnly ? (
        <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ backgroundColor: '#819898' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">🌱</span>
            <p className="text-xs font-medium text-white/70">Total saved</p>
          </div>
          <p className="text-sm text-white/90 leading-snug">Add your bank statement to see savings</p>
        </div>
      ) : (
        <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ backgroundColor: '#174D7C' }}>
          <div className="flex items-center gap-2">
            <span className="text-base animate-sway">🌱</span>
            <p className="text-xs font-medium text-white/70">Total saved</p>
          </div>
          <p className="text-2xl font-semibold text-white tracking-tight">{fmt(data.saved)}</p>
          {!hasComparison && (
            <p className="text-xs text-white/50 leading-snug">Upload a past month to compare</p>
          )}
        </div>
      )}

      {/* Biggest Category — teal blue */}
      <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ backgroundColor: '#4C7D8E' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🏷️</span>
          <p className="text-xs font-medium text-white/70">Biggest category</p>
        </div>
        <div className="flex items-center gap-2.5 mt-0.5">
          <span className="text-2xl">{getCategoryIcon(data.top_category)}</span>
          <p className="text-xl font-bold text-white leading-tight">{data.top_category}</p>
        </div>
      </div>

      {/* Watch Out — deeper orange */}
      <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ backgroundColor: '#FE6D4E' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">👀</span>
          <p className="text-xs font-medium text-stone-700">Watch out</p>
        </div>
        <p className="text-sm text-stone-800 leading-relaxed">{data.watchout}</p>
      </div>

    </div>
  )
}
