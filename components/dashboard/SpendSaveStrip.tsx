'use client'

import { useEffect, useState } from 'react'
import type { SummaryCards } from '@/types'

interface SpendSaveStripProps {
  data: SummaryCards | null
}

export function SpendSaveStrip({ data }: SpendSaveStripProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (!data) return
    const id = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(id)
  }, [data])

  if (!data) return null

  const { spent, saved } = data
  const total = spent + Math.max(saved, 0)
  const spentPct = total > 0 ? (spent / total) * 100 : 100
  const savedPct = total > 0 ? (Math.max(saved, 0) / total) * 100 : 0
  const savingsRate = total > 0 ? Math.round((Math.max(saved, 0) / total) * 100) : 0
  const creditCardOnly = saved <= 0

  const fmt = (n: number) =>
    'SGD ' + Math.abs(n).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className="rounded-2xl bg-white border border-stone-100 px-5 py-4 space-y-2.5">
      {/* Labels above bar */}
      <div className="flex justify-between text-sm font-medium">
        <span className="text-stone-700">{fmt(spent)} spent</span>
        {creditCardOnly ? (
          <span className="text-stone-400">— saved</span>
        ) : (
          <span className="text-green-700">{fmt(saved)} saved</span>
        )}
      </div>

      {/* Animated bar */}
      <div className="h-3 rounded-full bg-stone-100 overflow-hidden flex">
        <div
          className="h-full bg-amber-400 rounded-l-full transition-all duration-1000 ease-out"
          style={{ width: animated ? `${spentPct}%` : '0%' }}
        />
        {!creditCardOnly && (
          <div
            className="h-full bg-green-500 transition-all duration-1000 ease-out"
            style={{ width: animated ? `${savedPct}%` : '0%' }}
          />
        )}
      </div>

      {/* Savings rate below */}
      <p className="text-center text-xs text-stone-500">
        {creditCardOnly ? 'No savings tracked — credit card statement' : `${savingsRate}% saved`}
      </p>
    </div>
  )
}
