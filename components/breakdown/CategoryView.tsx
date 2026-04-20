'use client'

import { TransactionRow } from '@/components/transactions/TransactionRow'
import type { Transaction } from '@/types'

export function CategoryView({ transactions }: { transactions: Transaction[] }) {
  const groups = new Map<string, Transaction[]>()

  for (const tx of transactions) {
    if (tx.type === 'internal_transfer') continue
    const key = tx.user_category ?? tx.claude_category ?? 'Uncategorised'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }

  const sorted = [...groups.entries()].sort((a, b) => {
    const sumA = a[1].reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
    const sumB = b[1].reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
    return sumB - sumA
  })

  if (sorted.length === 0) {
    return <p className="text-sm text-stone-400 py-6 text-center">No transactions to show.</p>
  }

  return (
    <div className="space-y-6">
      {sorted.map(([category, txs]) => {
        const total = txs.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-stone-700">{category}</h3>
              <span className="text-sm font-medium text-stone-600">{total.toFixed(2)} SGD</span>
            </div>
            <div className="rounded-2xl bg-white border border-stone-100 px-4">
              {txs.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
