'use client'

import { friendlyUploadError } from '@/lib/utils/upload-errors'

interface Props {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: Props) {
  const display = friendlyUploadError(message)

  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-lg font-medium text-stone-500">
        !
      </div>
      <div>
        <p className="text-base font-semibold text-stone-800">Couldn’t finish that</p>
        <p className="mt-1 max-w-xs text-sm leading-relaxed text-stone-500">{display}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl border border-stone-300 bg-white px-6 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
      >
        Try again
      </button>
    </div>
  )
}
