'use client'

interface MonthSelectorProps {
  value: string // 'YYYY-MM'
  onChange: (month: string) => void
}

function formatMonthLabel(monthYear: string) {
  const [year, month] = monthYear.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })
}

function addMonths(monthYear: string, delta: number) {
  const [year, month] = monthYear.split('-').map(Number)
  const d = new Date(year, month - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function isCurrentOrPast(monthYear: string) {
  const now = new Date()
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return monthYear <= current
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const prev = addMonths(value, -1)
  const next = addMonths(value, 1)
  const canGoNext = isCurrentOrPast(next)

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(prev)}
        className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 transition flex items-center justify-center text-stone-600 text-sm"
        aria-label="Previous month"
      >
        ‹
      </button>
      <span className="font-medium text-stone-800 min-w-[140px] text-center">
        {formatMonthLabel(value)}
      </span>
      <button
        onClick={() => canGoNext && onChange(next)}
        disabled={!canGoNext}
        className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 transition flex items-center justify-center text-stone-600 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  )
}
