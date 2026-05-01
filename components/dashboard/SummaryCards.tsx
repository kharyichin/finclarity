import { getCategoryIcon } from '@/lib/utils/categories'
import type { SummaryCards as SummaryCardsType } from '@/types'

function SparkleIcon() {
  return (
    <span className="relative inline-flex items-center justify-center w-5 h-5 shrink-0">
      {/* Small star — first */}
      <span className="absolute top-0 left-0 text-[7px] text-white animate-sparkle-1">✦</span>
      {/* Mid star — second */}
      <span className="absolute bottom-0 left-1 text-[10px] text-white animate-sparkle-2">✦</span>
      {/* Large star — last */}
      <span className="absolute top-0 right-0 text-[15px] text-white animate-sparkle-3">✦</span>
    </span>
  )
}

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

      {/* Total Spent — terracotta, dark text */}
      <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ backgroundColor: '#D4845A' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">💸</span>
          <p className="text-xs font-medium text-white">Total spent</p>
        </div>
        <p className="text-2xl font-semibold text-white tracking-tight">{fmt(data.spent)}</p>
      </div>

      {/* Total Saved — deep teal, white text */}
      {creditCardOnly ? (
        <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ backgroundColor: '#4A8078' }}>
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <p className="text-xs font-medium text-white/80">Total saved</p>
          </div>
          <p className="text-sm text-white/70 leading-snug">Add your bank statement to see savings</p>
        </div>
      ) : (
        <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ backgroundColor: '#4A8078' }}>
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <p className="text-xs font-medium text-white/80">Total saved</p>
          </div>
          <p className="text-2xl font-semibold text-white tracking-tight">{fmt(data.saved)}</p>
          {!hasComparison && (
            <p className="text-xs text-white/60 leading-snug">Upload a past month to compare</p>
          )}
        </div>
      )}

      {/* Biggest Category — deep summer sky, white text */}
      <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ backgroundColor: '#4A8098' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🏷️</span>
          <p className="text-xs font-medium text-white/80">Biggest category</p>
        </div>
        <div className="flex items-center gap-2.5 mt-0.5">
          <span className="text-2xl">{getCategoryIcon(data.top_category)}</span>
          <p className="text-xl font-bold text-white leading-tight">{data.top_category}</p>
        </div>
      </div>

      {/* Watch Out — warm cream, dark text */}
      <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ backgroundColor: '#F0D0A0' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">👀</span>
          <p className="text-xs font-medium text-stone-700">Watch out</p>
        </div>
        <p className="text-sm font-medium text-stone-800 leading-relaxed">{data.watchout}</p>
      </div>

    </div>
  )
}
