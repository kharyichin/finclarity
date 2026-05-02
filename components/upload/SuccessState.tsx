'use client'

import { useEffect, useRef } from 'react'

interface Props {
  onDone: () => void
  isAnonymous?: boolean
}

export function SuccessState({ onDone, isAnonymous }: Props) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl animate-bounce">
        ✓
      </div>
      <div>
        <p className="text-lg font-semibold text-stone-800">Statement processed</p>
        <p className="text-sm text-stone-500 mt-1">
          {isAnonymous
            ? 'Password discarded. Taking you to your dashboard…'
            : 'Password discarded. Your transactions are ready.'}
        </p>
      </div>
      <button
        onClick={() => onDoneRef.current()}
        className="text-xs text-stone-400 hover:text-stone-600 transition"
      >
        Go now →
      </button>
    </div>
  )
}
