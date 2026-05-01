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
      <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ backgroundColor: '#1C284E' }}>
        <span className="text-3xl">🌿</span>
        <p className="text-sm leading-relaxed text-white/80">
          Upload your first bank statement to get a clear, narrative picture of where your money went this month.
        </p>
        <button
          onClick={onUpload}
          className="self-start rounded-xl px-5 py-2 text-sm font-medium transition"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
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
  let noteColor = 'text-emerald-300'
  if (hasBudget) {
    if (over) {
      budgetNote = `${fmt(spent! - budgetTotal!)} over your monthly budget`
      noteColor = 'text-rose-300'
    } else if (pct! >= 80) {
      budgetNote = `${pct}% of budget used — getting close`
      noteColor = 'text-amber-300'
    } else {
      budgetNote = `${pct}% of budget used — on track`
      noteColor = 'text-emerald-300'
    }
  }

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: '#1C284E' }}>
      <p className="leading-relaxed text-[15px] text-white/90">{narrative}</p>
      {budgetNote && (
        <p className={`mt-3 pt-3 text-xs border-t border-white/10 ${noteColor}`}>
          {budgetNote}
        </p>
      )}
    </div>
  )
}
