import type { SummaryCards as SummaryCardsType } from '@/types'

interface SummaryCardsProps {
  data: SummaryCardsType | null
  hasComparison: boolean
}

function fmt(amount: number) {
  return `SGD ${amount.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface CardProps {
  label: string
  value: string
  sub?: string
  accent?: string
}

function Card({ label, value, sub, accent = 'bg-white' }: CardProps) {
  return (
    <div className={`rounded-2xl border border-stone-200 ${accent} p-5 flex flex-col gap-1`}>
      <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold text-stone-800">{value}</p>
      {sub && <p className="text-xs text-stone-400">{sub}</p>}
    </div>
  )
}

export function SummaryCards({ data, hasComparison }: SummaryCardsProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {['Total Spent', 'Total Saved', 'Biggest Category', 'Watch Out'].map((label) => (
          <div key={label} className="rounded-2xl border border-stone-200 bg-white p-5 animate-pulse">
            <div className="h-3 w-20 bg-stone-100 rounded mb-3" />
            <div className="h-6 w-28 bg-stone-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card label="Total Spent" value={fmt(data.spent)} accent="bg-white" />
      <Card
        label="Total Saved"
        value={fmt(data.saved)}
        sub={!hasComparison ? 'Upload a past statement to unlock comparisons' : undefined}
        accent="bg-green-50"
      />
      <Card label="Biggest Category" value={data.top_category} />
      <Card label="Watch Out" value={data.watchout} accent="bg-amber-50" />
    </div>
  )
}
