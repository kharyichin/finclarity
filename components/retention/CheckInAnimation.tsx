'use client'

import { useEffect, useState } from 'react'
import { calculateStreak } from '@/lib/utils/streak'
import type { CheckIn } from '@/types'

interface Props {
  onDone: () => void
}

export function CheckInAnimation({ onDone }: Props) {
  const [streak, setStreak] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/checkins')
        if (res.ok) {
          const data: CheckIn[] = await res.json()
          setStreak(calculateStreak(data))
        }
      } catch { /* ignore */ }
    }
    load()
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  const unlocked =
    streak === 2 ? 'You can now see month-over-month comparisons.' :
    streak === 3 ? 'You can now see 3-month spending trends.' :
    streak !== null && streak >= 6 ? 'You\'re building a real financial picture.' :
    null

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center animate-fade-in">
      <div className="text-5xl animate-bounce">🌿</div>
      <div>
        <p className="text-lg font-semibold text-stone-800">
          {streak !== null && streak > 1
            ? `${streak} months in a row!`
            : 'First month checked in!'}
        </p>
        <p className="text-sm text-stone-500 mt-1">
          Your picture is getting clearer.
        </p>
        {unlocked && (
          <p className="text-xs text-green-600 font-medium mt-2">{unlocked}</p>
        )}
      </div>
      <button
        onClick={onDone}
        className="text-xs text-stone-400 hover:text-stone-600 transition mt-2"
      >
        Continue →
      </button>
    </div>
  )
}
