'use client'

import { getCalendarWeeks } from '@/lib/utils/dates'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import type { Transaction } from '@/types'

export function TimeView({ transactions, month }: { transactions: Transaction[]; month: string }) {
  const weeks = getCalendarWeeks(month)

  const buckets = weeks.map((week) => {
    const txs = transactions.filter((tx) => {
      const d = new Date(tx.date)
      return d >= week.start && d <= week.end
    })
    return { week, txs }
  })

  const hasAny = buckets.some((b) => b.txs.length > 0)
  if (!hasAny) {
    return <p className="text-sm text-stone-400 py-6 text-center">No transactions to show.</p>
  }

  return (
    <div className="space-y-6">
      {buckets.filter((b) => b.txs.length > 0).map(({ week, txs }) => {
        const total = txs
          .filter((t) => t.type === 'expense')
          .reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
        return (
          <div key={week.label}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-stone-700">{week.label}</h3>
              <span className="text-sm text-stone-500">{total.toFixed(2)} SGD spent</span>
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
