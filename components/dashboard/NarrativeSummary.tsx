import { getCategoryIcon } from '@/lib/utils/categories'

interface NarrativeSummaryProps {
  narrative: string | null
  hasUploads: boolean
  onUpload: () => void
  topCategory?: string | null
}

export function NarrativeSummary({ narrative, hasUploads, onUpload, topCategory }: NarrativeSummaryProps) {
  if (!hasUploads || !narrative) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-stone-50 border border-green-100 p-6 flex flex-col gap-4">
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

  const icon = topCategory ? getCategoryIcon(topCategory) : '🌿'

  return (
    <div className="rounded-2xl bg-gradient-to-br from-green-50 to-stone-50 border border-green-100 p-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0 flex flex-col items-center gap-1 mt-0.5">
          <span className="text-2xl">{icon}</span>
          {topCategory && (
            <span className="text-[10px] font-medium text-stone-400 text-center leading-tight max-w-[48px] truncate">
              {topCategory}
            </span>
          )}
        </div>
        <p className="text-stone-700 leading-relaxed text-[15px]">{narrative}</p>
      </div>
    </div>
  )
}
