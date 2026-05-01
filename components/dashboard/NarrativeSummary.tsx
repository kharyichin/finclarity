interface NarrativeSummaryProps {
  narrative: string | null
  hasUploads: boolean
  onUpload: () => void
  spent?: number | null
  budgetTotal?: number | null
}

export function NarrativeSummary({ narrative, hasUploads, onUpload, spent, budgetTotal }: NarrativeSummaryProps) {
  if (!hasUploads || !narrative) {
    return (
      <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ backgroundColor: '#6B8EA0' }}>
        <span className="text-3xl">🌿</span>
        <p className="text-sm leading-relaxed text-stone-800">
          Upload your first bank statement to get a clear, narrative picture of where your money went this month.
        </p>
        <button
          onClick={onUpload}
          className="self-start rounded-xl bg-white/20 px-5 py-2 text-sm font-medium text-stone-800 hover:bg-white/30 transition"
        >
          Upload a statement
        </button>
      </div>
    )
  }

  const hasBudget = budgetTotal != null && budgetTotal > 0 && spent != null
  const pct = hasBudget ? Math.round((spent! / budgetTotal!) * 100) : null
  const over = hasBudget && spent! > budgetTotal!
  const fmt = (n: number) =>
    'SGD ' + Math.abs(n).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  let budgetNote: string | null = null
  let noteColor = 'text-emerald-800'
  if (hasBudget) {
    if (over) {
      budgetNote = `${fmt(spent! - budgetTotal!)} over your monthly budget`
      noteColor = 'text-red-800'
    } else if (pct! >= 80) {
      budgetNote = `${pct}% of budget used — getting close`
      noteColor = 'text-amber-800'
    } else {
      budgetNote = `${pct}% of budget used — on track`
      noteColor = 'text-emerald-800'
    }
  }

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: '#6B8EA0' }}>
      <p className="leading-relaxed text-[15px] text-stone-800">{narrative}</p>
      {budgetNote && (
        <p className={`mt-3 pt-3 text-xs border-t border-stone-300/50 ${noteColor}`}>
          {budgetNote}
        </p>
      )}
    </div>
  )
}
