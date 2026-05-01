'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BudgetCallouts } from './BudgetCallouts'
import type { SummaryCards } from '@/types'

interface SpendSaveStripProps {
  data: SummaryCards | null
  budget?: number | null
  categoryBudgets?: Record<string, number> | null
  month?: string
  isAnonymous?: boolean
}

export function SpendSaveStrip({ data, budget, categoryBudgets, month, isAnonymous }: SpendSaveStripProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (!data) return
    setAnimated(false)
    let id1: number, id2: number
    id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setAnimated(true))
    })
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2) }
  }, [data])

  if (!data) return null

  const { spent, saved } = data
  const total = spent + Math.max(saved, 0)
  const spentPct = total > 0 ? (spent / total) * 100 : 100
  const savedPct = total > 0 ? (Math.max(saved, 0) / total) * 100 : 0
  const savingsRate = total > 0 ? Math.round((Math.max(saved, 0) / total) * 100) : 0
  const creditCardOnly = saved <= 0

  const budgetPct = budget != null && budget > 0 && total > 0
    ? Math.min((budget / total) * 100, 100)
    : null

  const budgetPct2 = budget != null && budget > 0
    ? Math.round((spent / budget) * 100)
    : null
  const overBudget = budget != null && spent > budget

  const hasCategoryBudgets = categoryBudgets != null && Object.keys(categoryBudgets).length > 0

  const fmt = (n: number) =>
    'SGD ' + Math.abs(n).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className="rounded-2xl bg-white border border-stone-100 px-5 py-4 space-y-2.5">
      {/* Spend / save labels */}
      <div className="flex justify-between text-sm font-medium">
        <span className="text-stone-700">{fmt(spent)} spent</span>
        {creditCardOnly
          ? <span className="text-stone-400">— saved</span>
          : <span className="text-green-700">{fmt(saved)} saved</span>}
      </div>

      {/* Animated bar with optional budget marker */}
      <div className="relative h-3">
        <div className="absolute inset-0 rounded-full bg-stone-100 overflow-hidden flex">
          <div
            className="h-full bg-amber-400 transition-all duration-1000 ease-out"
            style={{ width: animated ? `${spentPct}%` : '0%' }}
          />
          {!creditCardOnly && (
            <div
              className="h-full bg-green-500 transition-all duration-1000 ease-out"
              style={{ width: animated ? `${savedPct}%` : '0%' }}
            />
          )}
        </div>
        {budgetPct != null && (
          <div
            className="absolute top-0 h-full z-10"
            style={{ left: `${budgetPct}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-[2px] h-full rounded-full bg-stone-700/50" />
          </div>
        )}
      </div>

      {/* Bottom row — savings rate + budget status */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-stone-500">
          {creditCardOnly ? 'Credit card — no savings tracked' : `${savingsRate}% saved`}
        </p>
        {!isAnonymous && budget != null && (
          <div className="flex items-center gap-2">
            <p className={`text-xs ${overBudget ? 'text-red-500' : 'text-stone-500'}`}>
              {overBudget
                ? `${fmt(spent - budget)} over budget`
                : `${budgetPct2}% of ${fmt(budget)} budget`}
            </p>
            <Link href="/budget" className="text-xs text-stone-400 hover:text-stone-600 transition">
              Edit →
            </Link>
          </div>
        )}
        {!isAnonymous && budget == null && (
          <Link href="/budget" className="text-xs text-stone-400 hover:text-stone-600 transition">
            Set a budget →
          </Link>
        )}
      </div>

      {/* Category over-budget pills */}
      {!isAnonymous && hasCategoryBudgets && month && (
        <BudgetCallouts month={month} categoryBudgets={categoryBudgets!} />
      )}
    </div>
  )
}
