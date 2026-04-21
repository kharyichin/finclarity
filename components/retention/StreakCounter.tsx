'use client'

import { useEffect, useState } from 'react'
import { calculateStreak } from '@/lib/utils/streak'
import type { CheckIn } from '@/types'

export function StreakCounter() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/checkins')
        if (!res.ok) return
        const data: CheckIn[] = await res.json()
        setStreak(calculateStreak(data))
      } catch { /* silently ignore */ }
    }
    load()
  }, [])

  if (streak === 0) return null

  return (
    <div className="flex items-center gap-1.5 text-sm text-stone-600">
      <span>🌱</span>
      <span>{streak} month{streak !== 1 ? 's' : ''} in a row</span>
    </div>
  )
}
