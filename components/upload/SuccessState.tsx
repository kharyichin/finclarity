'use client'

interface Props {
  onDone: () => void
}

export function SuccessState({ onDone }: Props) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl animate-bounce">
        ✓
      </div>
      <div>
        <p className="text-lg font-semibold text-stone-800">Statement processed</p>
        <p className="text-sm text-stone-500 mt-1">
          Password discarded. Your transactions are ready.
        </p>
      </div>
      <p className="text-xs text-stone-400 bg-stone-100 rounded-lg px-4 py-2 max-w-xs">
        We never store your PDF or password — only the transaction data you see here.
      </p>
      <button
        onClick={onDone}
        className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition"
      >
        View your dashboard
      </button>
    </div>
  )
}
