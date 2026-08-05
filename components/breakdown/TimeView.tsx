'use client'

import { getCalendarWeeks, parseLocalDate } from '@/lib/utils/dates'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import type { Transaction } from '@/types'

export function TimeView({
  transactions,
  month,
  onCategoryChange,
}: {
  transactions: Transaction[]
  month: string
  onCategoryChange?: (txId: string, category: string) => void | Promise<void>
}) {
  const weeks = getCalendarWeeks(month)

  const buckets = weeks.map((week) => {
    const txs = transactions.filter((tx) => {
      const d = parseLocalDate(tx.date)
      return d >= week.start && d <= week.end
    })
    const spent = txs
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
    return { week, txs, spent }
  })

  const hasAny = buckets.some((b) => b.txs.length > 0)
  if (!hasAny) {
    return <p className="text-sm text-stone-400 py-6 text-center">No transactions to show.</p>
  }

  const maxSpent = Math.max(...buckets.map((b) => b.spent), 1)
  const totalSpent = buckets.reduce((s, b) => s + b.spent, 0)

  return (
    <div className="space-y-6">
      {/* Weekly bar chart */}
      <div className="rounded-2xl bg-white border border-stone-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Weekly Spending</p>
          <p className="text-xs text-stone-400">{totalSpent.toFixed(2)} SGD total</p>
        </div>

        <div className="space-y-2">
          {buckets.map(({ week, spent }) => {
            const pct = maxSpent > 0 ? (spent / maxSpent) * 100 : 0
            const isMax = spent === maxSpent && spent > 0
            const weekId = `week-${week.label.replace(/[^a-z0-9]/gi, '-')}`
            return (
              <button
                key={week.label}
                onClick={() => document.getElementById(weekId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="flex items-center gap-3 w-full hover:opacity-70 transition"
                disabled={spent === 0}
              >
                <span className="text-xs text-stone-400 w-24 shrink-0 text-left">{week.label}</span>
                <div className="flex-1 h-6 bg-stone-100 rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg transition-all ${isMax ? 'bg-green-500' : 'bg-green-300'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-stone-600 w-24 text-right shrink-0">
                  {spent > 0 ? `${spent.toFixed(2)} SGD` : '—'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Per-week transaction lists */}
      {buckets.filter((b) => b.txs.length > 0).map(({ week, txs, spent }) => (
        <div key={week.label} id={`week-${week.label.replace(/[^a-z0-9]/gi, '-')}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-stone-700">{week.label}</h3>
            <span className="text-sm text-stone-500">{spent.toFixed(2)} SGD spent</span>
          </div>
          <div className="rounded-2xl bg-white border border-stone-100 px-4">
            {txs.map((tx) => <TransactionRow key={tx.id} tx={tx} onCategoryChange={onCategoryChange} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
