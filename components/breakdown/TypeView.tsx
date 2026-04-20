'use client'

import { TransactionRow } from '@/components/transactions/TransactionRow'
import type { Transaction } from '@/types'

const typeLabels: Record<string, string> = {
  income: 'Income',
  expense: 'Expenses',
  transfer: 'Transfers',
}

export function TypeView({ transactions }: { transactions: Transaction[] }) {
  const income = transactions.filter((t) => t.type === 'income')
  const expenses = transactions.filter((t) => t.type === 'expense')
  const transfers = transactions.filter(
    (t) => t.type === 'transfer' || t.type === 'internal_transfer'
  )

  const groups: [string, Transaction[]][] = [
    ['income', income],
    ['expense', expenses],
    ['transfer', transfers],
  ].filter(([, txs]) => (txs as Transaction[]).length > 0) as [string, Transaction[]][]

  const expenseTotal = expenses.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
  const incomeTotal = income.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)

  if (groups.length === 0) {
    return <p className="text-sm text-stone-400 py-6 text-center">No transactions to show.</p>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
          <p className="text-xs text-green-600 font-medium">Total Income</p>
          <p className="text-lg font-bold text-green-700 mt-1">+{incomeTotal.toFixed(2)} SGD</p>
        </div>
        <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
          <p className="text-xs text-stone-500 font-medium">Total Expenses</p>
          <p className="text-lg font-bold text-stone-700 mt-1">-{expenseTotal.toFixed(2)} SGD</p>
        </div>
      </div>

      {groups.map(([type, txs]) => (
        <div key={type}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-stone-700">{typeLabels[type] ?? type}</h3>
            <span className="text-xs text-stone-400">{txs.length} transactions</span>
          </div>
          {type === 'transfer' && (
            <p className="text-xs text-stone-400 mb-2 italic">
              Internal transfers are excluded from expense totals.
            </p>
          )}
          <div className="rounded-2xl bg-white border border-stone-100 px-4">
            {txs.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
