'use client'

import { useEffect, useState } from 'react'
import { calculateStreak } from '@/lib/utils/streak'
import type { CheckIn } from '@/types'

interface Props {
  onDone: () => void
}

function getFlower(streak: number): string {
  if (streak >= 6) return '🌺'
  if (streak >= 3) return '🌸'
  return '🌿'
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
    const t = setTimeout(onDone, 5000)
    return () => clearTimeout(t)
  }, [onDone])

  const unlocked =
    streak === 2 ? 'Month-over-month comparisons are now unlocked.' :
    streak === 3 ? '3-month spending trends are now visible.' :
    streak !== null && streak >= 6 ? 'You\'re building a real financial picture.' :
    null

  const flower = getFlower(streak ?? 1)

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">

      {/* Growing plant animation */}
      <div className="flex flex-col items-center" style={{ gap: 0 }}>
        {/* Flower — blooms last */}
        <span className="text-4xl plant-bloom">{flower}</span>
        {/* Stem — grows upward from the pot */}
        <div className="w-[3px] h-12 rounded-full bg-green-400 plant-stem-grow" />
        {/* Pot — rises in first */}
        <span className="text-5xl plant-pot-rise">🪴</span>
      </div>

      <div>
        <p className="text-lg font-semibold text-stone-800">
          {streak !== null && streak > 1
            ? `${streak} months in a row!`
            : 'First month checked in!'}
        </p>
        <p className="text-sm text-stone-500 mt-1">Your picture is getting clearer.</p>
        {unlocked && (
          <p className="text-xs text-green-600 font-medium mt-2">{unlocked}</p>
        )}
      </div>

      <button
        onClick={onDone}
        className="text-xs text-stone-400 hover:text-stone-600 transition"
      >
        Continue →
      </button>
    </div>
  )
}
