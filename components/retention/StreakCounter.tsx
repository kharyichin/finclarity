'use client'

import { useEffect, useState } from 'react'
import { calculateStreak } from '@/lib/utils/streak'
import type { CheckIn } from '@/types'

export function StreakCounter() {
  const [streak, setStreak] = useState(0)
  const [joinedSince, setJoinedSince] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [checkinsRes, statementsRes] = await Promise.all([
          fetch('/api/checkins'),
          fetch('/api/statements'),
        ])
        if (checkinsRes.ok) {
          const data: CheckIn[] = await checkinsRes.json()
          setStreak(calculateStreak(data))
        }
        if (statementsRes.ok) {
          const statements = await statementsRes.json()
          if (Array.isArray(statements) && statements.length > 0) {
            const earliest = statements.reduce((a: { uploaded_at: string }, b: { uploaded_at: string }) =>
              a.uploaded_at < b.uploaded_at ? a : b
            )
            setJoinedSince(
              new Date(earliest.uploaded_at).toLocaleDateString('en-SG', { month: 'short', year: '2-digit' })
            )
          }
        }
      } catch { /* silently ignore */ }
    }
    load()
  }, [])

  if (streak === 0) return null

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-1.5 text-sm text-stone-600">
        <span>🌱</span>
        <span>{streak} month{streak !== 1 ? 's' : ''} in a row</span>
      </div>
      {joinedSince && (
        <span className="text-xs text-stone-400">joined since {joinedSince}</span>
      )}
    </div>
  )
}
