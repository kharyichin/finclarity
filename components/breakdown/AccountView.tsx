'use client'

import { TransactionRow } from '@/components/transactions/TransactionRow'
import type { Transaction } from '@/types'

const ACCOUNT_COLOURS = [
  'bg-sky-400',
  'bg-violet-400',
  'bg-amber-400',
  'bg-teal-400',
  'bg-rose-400',
  'bg-indigo-400',
]

const ACCOUNT_LIGHT = [
  'bg-sky-50 border-sky-100',
  'bg-violet-50 border-violet-100',
  'bg-amber-50 border-amber-100',
  'bg-teal-50 border-teal-100',
  'bg-rose-50 border-rose-100',
  'bg-indigo-50 border-indigo-100',
]

export function AccountView({ transactions }: { transactions: Transaction[] }) {
  // Group ALL transactions by account for the list, but only expenses for chart totals
  const groups = new Map<string, { label: string; all: Transaction[]; expenses: Transaction[] }>()

  for (const tx of transactions) {
    const key = tx.account_last4 ?? 'unknown'
    const label = tx.bank_name && tx.account_last4
      ? `${tx.bank_name} ···${tx.account_last4}`
      : tx.bank_name ?? 'Unknown Account'
    if (!groups.has(key)) groups.set(key, { label, all: [], expenses: [] })
    const g = groups.get(key)!
    g.all.push(tx)
    if (tx.type === 'expense') g.expenses.push(tx)
  }

  if (groups.size === 0) {
    return <p className="text-sm text-stone-400 py-6 text-center">No transactions to show.</p>
  }

  const accountTotals = [...groups.entries()]
    .map(([key, g]) => ({
      key,
      label: g.label,
      spent: g.expenses.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0),
      all: g.all,
    }))
    .sort((a, b) => b.spent - a.spent)

  const grandTotal = accountTotals.reduce((s, a) => s + a.spent, 0)

  return (
    <div className="space-y-6">
      {/* Spending by account chart */}
      <div className="rounded-2xl bg-white border border-stone-100 p-4 space-y-3">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Spending by Card / Account</p>

        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {accountTotals.map(({ key, spent }, i) => (
            grandTotal > 0 && (
              <div
                key={key}
                className={`${ACCOUNT_COLOURS[i % ACCOUNT_COLOURS.length]} transition-all`}
                style={{ width: `${(spent / grandTotal) * 100}%` }}
              />
            )
          ))}
        </div>

        <div className="space-y-1.5">
          {accountTotals.map(({ key, label, spent }, i) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${ACCOUNT_COLOURS[i % ACCOUNT_COLOURS.length]}`} />
                <span className="text-xs text-stone-700 font-medium">{label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400">
                  {grandTotal > 0 ? ((spent / grandTotal) * 100).toFixed(0) : 0}%
                </span>
                <span className="text-xs font-semibold text-stone-600 w-28 text-right">
                  {spent.toFixed(2)} SGD
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-account transaction lists */}
      {accountTotals.map(({ key, label, spent, all }, i) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${ACCOUNT_COLOURS[i % ACCOUNT_COLOURS.length]}`} />
              {label}
            </h3>
            <span className="text-sm text-stone-500">{spent.toFixed(2)} SGD spent</span>
          </div>
          <div className={`rounded-2xl border px-4 ${ACCOUNT_LIGHT[i % ACCOUNT_LIGHT.length]}`}>
            {all.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
