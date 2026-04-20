'use client'

interface Props {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl">
        !
      </div>
      <div>
        <p className="text-base font-semibold text-stone-800">Something went wrong</p>
        <p className="text-sm text-stone-500 mt-1 max-w-xs">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="rounded-xl border border-stone-300 bg-white px-6 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
      >
        Try again
      </button>
    </div>
  )
}
