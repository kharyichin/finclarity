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
    <div className="flex flex-wrap gap-2">
      {callouts.map(({ category, type, amount }) => (
        <span
          key={category}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            type === 'over'
              ? 'bg-red-50 text-red-600 border border-red-100'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}
        >
          <span>{getCategoryIcon(category)}</span>
          <span>{category}</span>
          <span className="opacity-60">·</span>
          <span>{type === 'over' ? `${fmt(amount)} over` : `${fmt(amount)} left`}</span>
        </span>
      ))}
    </div>
  )
}
