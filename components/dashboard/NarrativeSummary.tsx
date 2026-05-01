interface NarrativeSummaryProps {
  narrative: string | null
  hasUploads: boolean
  onUpload: () => void
  topCategory?: string | null
  spent?: number | null
  budgetTotal?: number | null
}

export function NarrativeSummary({ narrative, hasUploads, onUpload, spent, budgetTotal }: NarrativeSummaryProps) {
  if (!hasUploads || !narrative) {
    return (
      <div className="rounded-2xl bg-stone-100 border border-stone-200 p-6 flex flex-col gap-4">
        <span className="text-3xl">🌿</span>
        <p className="text-stone-600 text-sm leading-relaxed">
          Upload your first bank statement to get a clear, narrative picture of where your money went this month.
        </p>
        <button
          onClick={onUpload}
          className="self-start rounded-xl bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
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
  let noteColor = 'text-green-600'
  if (hasBudget) {
    if (over) {
      budgetNote = `${fmt(spent! - budgetTotal!)} over your monthly budget`
      noteColor = 'text-red-500'
    } else if (pct! >= 80) {
      budgetNote = `${pct}% of budget used — getting close`
      noteColor = 'text-amber-600'
    } else {
      budgetNote = `${pct}% of budget used — on track`
      noteColor = 'text-green-600'
    }
  }

  return (
    <div className="rounded-2xl bg-stone-100 border border-stone-200 p-6">
      <p className="text-stone-700 leading-relaxed text-[15px]">{narrative}</p>
      {budgetNote && (
        <p className={`mt-3 pt-3 border-t border-stone-200 text-xs ${noteColor}`}>
          {budgetNote}
        </p>
      )}
    </div>
  )
}
