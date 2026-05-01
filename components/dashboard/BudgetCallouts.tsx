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
          // over-budget first, then by amount descending
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
    <div className="space-y-2">
      {callouts.map(({ category, type, amount, budget }) => (
        <div
          key={category}
          className={`rounded-2xl border px-4 py-3 flex items-start gap-3 ${
            type === 'over' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
          }`}
        >
          <span className="text-lg shrink-0 mt-0.5">{getCategoryIcon(category)}</span>
          <div>
            <p className={`text-sm font-medium ${type === 'over' ? 'text-red-700' : 'text-emerald-700'}`}>
              {type === 'over'
                ? `${category} is ${fmt(amount)} over budget`
                : `${category} well under budget — ${fmt(amount)} left`}
            </p>
            <p className={`text-xs mt-0.5 ${type === 'over' ? 'text-red-400' : 'text-emerald-400'}`}>
              {fmt(budget)} budgeted · {fmt(type === 'over' ? budget + amount : budget - amount)} spent
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
