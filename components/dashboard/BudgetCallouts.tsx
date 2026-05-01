'use client'

import { useState, useEffect } from 'react'
import { getCategoryIcon } from '@/lib/utils/categories'
import type { Transaction } from '@/types'

interface Callout {
  category: string
  type: 'over' | 'under'
  amount: number
  budget: number
}

interface Props {
  month: string
  categoryBudgets: Record<string, number>
}

export function BudgetCallouts({ month, categoryBudgets }: Props) {
  const [callouts, setCallouts] = useState<Callout[]>([])

  useEffect(() => {
    const entries = Object.entries(categoryBudgets).filter(([, v]) => v > 0)
    if (entries.length === 0) { setCallouts([]); return }

    fetch(`/api/transactions?month=${month}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((transactions: Transaction[]) => {
        const spend: Record<string, number> = {}
        for (const tx of transactions) {
          if (tx.type !== 'expense') continue
          const cat = tx.claude_category ?? 'Other'
          spend[cat] = (spend[cat] ?? 0) + (tx.sgd_amount ?? tx.amount)
        }
        const totalSpend = Object.values(spend).reduce((s, v) => s + v, 0)

        const results: Callout[] = []
        for (const [cat, budget] of entries) {
          const spent = spend[cat] ?? 0
          if (spent > budget) {
            results.push({ category: cat, type: 'over', amount: spent - budget, budget })
          } else if (totalSpend > 50 && spent > 0 && spent < budget * 0.3) {
            results.push({ category: cat, type: 'under', amount: budget - spent, budget })
          }
        }

        results.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'over' ? -1 : 1
          return b.amount - a.amount
        })
        setCallouts(results.slice(0, 4))
      })
      .catch(() => {})
  }, [month, categoryBudgets])

  if (callouts.length === 0) return null

  const fmt = (n: number) =>
    'SGD ' + n.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className="rounded-2xl bg-white border border-stone-100 px-5 py-3.5 space-y-2">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">Budget notes</p>
      {callouts.map(({ category, type, amount }) => (
        <div key={category} className="flex items-center gap-2.5">
          <span
            className={`shrink-0 w-1.5 h-1.5 rounded-full ${type === 'over' ? 'bg-red-400' : 'bg-emerald-400'}`}
          />
          <span className="text-base shrink-0">{getCategoryIcon(category)}</span>
          <span className="text-sm text-stone-600 flex-1 min-w-0 truncate">{category}</span>
          <span className={`text-xs shrink-0 ${type === 'over' ? 'text-red-500' : 'text-emerald-600'}`}>
            {type === 'over' ? `${fmt(amount)} over` : `${fmt(amount)} left`}
          </span>
        </div>
      ))}
    </div>
  )
}
