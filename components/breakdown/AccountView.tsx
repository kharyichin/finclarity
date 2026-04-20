'use client'

import { TransactionRow } from '@/components/transactions/TransactionRow'
import type { Transaction } from '@/types'

export function AccountView({ transactions }: { transactions: Transaction[] }) {
  const groups = new Map<string, Transaction[]>()

  for (const tx of transactions) {
    const key = tx.bank_name && tx.account_last4
      ? `${tx.bank_name} ···${tx.account_last4}`
      : tx.bank_name ?? 'Unknown Account'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }

  if (groups.size === 0) {
    return <p className="text-sm text-stone-400 py-6 text-center">No transactions to show.</p>
  }

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([account, txs]) => {
        const expenses = txs.filter((t) => t.type === 'expense')
        const total = expenses.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
        return (
          <div key={account}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-stone-700">{account}</h3>
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
