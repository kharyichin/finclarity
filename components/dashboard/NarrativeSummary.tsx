interface NarrativeSummaryProps {
  narrative: string | null
  hasUploads: boolean
  onUpload: () => void
}

export function NarrativeSummary({ narrative, hasUploads, onUpload }: NarrativeSummaryProps) {
  if (!hasUploads || !narrative) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-stone-50 border border-green-100 p-6">
        <p className="text-2xl mb-2">🌿</p>
        <p className="text-stone-600 text-sm leading-relaxed">
          Upload your first bank statement to get a clear, narrative picture of where your money went this month.
        </p>
        <button
          onClick={onUpload}
          className="mt-4 rounded-xl bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
        >
          Upload a statement
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-green-50 to-stone-50 border border-green-100 p-6">
      <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-3">Monthly Summary</p>
      <p className="text-stone-700 leading-relaxed">{narrative}</p>
    </div>
  )
}
