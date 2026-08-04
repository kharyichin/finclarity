interface Props {
  spent: number | null | undefined
  saved: number | null | undefined
  topCategory?: string | null
  creditCardOnly?: boolean
}

function fmt(n: number) {
  return n.toLocaleString('en-SG', { maximumFractionDigits: 0 })
}

export function MonthMixVisual({ spent, saved, topCategory, creditCardOnly }: Props) {
  if (spent == null || spent < 0) return null

  const saveVal = creditCardOnly ? 0 : Math.max(0, saved ?? 0)
  const total = spent + saveVal
  const spendPct = total > 0 ? Math.round((spent / total) * 100) : 100
  const savePct = total > 0 ? 100 - spendPct : 0

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/40">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-stone-800">This month at a glance</h3>
        {topCategory ? (
          <p className="truncate text-xs text-stone-400">Biggest: {topCategory}</p>
        ) : null}
      </div>

      <div className="flex h-3 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full bg-[#D4845A] transition-all duration-500"
          style={{ width: `${Math.max(spendPct, total === 0 ? 0 : 8)}%` }}
          title="Spent"
        />
        {!creditCardOnly && saveVal > 0 ? (
          <div
            className="h-full bg-[#4A8078] transition-all duration-500"
            style={{ width: `${Math.max(savePct, 4)}%` }}
            title="Saved"
          />
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#D4845A]" />
          Spent SGD {fmt(spent)}
          {total > 0 ? <span className="text-stone-400">({spendPct}%)</span> : null}
        </span>
        {!creditCardOnly ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#4A8078]" />
            Saved SGD {fmt(saveVal)}
            {total > 0 && saveVal > 0 ? <span className="text-stone-400">({savePct}%)</span> : null}
          </span>
        ) : (
          <span className="text-stone-400">Card statement — savings need a bank upload</span>
        )}
      </div>
    </div>
  )
}
