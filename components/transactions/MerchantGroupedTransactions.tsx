'use client'

import { useState } from 'react'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import type { Transaction } from '@/types'

interface Props {
  txs: Transaction[]
  onCategoryChange?: (txId: string, category: string) => void | Promise<void>
}

function MerchantGroup({
  merchant,
  txs,
  onCategoryChange,
}: {
  merchant: string
  txs: Transaction[]
  onCategoryChange?: (txId: string, category: string) => void | Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const total = txs.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
  const isIncome = txs.every((t) => t.type === 'income')
  const isTransfer = txs.every((t) => t.type === 'transfer' || t.type === 'internal_transfer')

  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-stone-50/60 transition rounded-lg px-1 -mx-1"
      >
        <div className="min-w-0 flex-1 pr-2">
          <p className="truncate text-sm font-medium text-stone-800">
            {merchant}
            <span className="ml-1.5 text-xs font-normal text-stone-400">× {txs.length}</span>
          </p>
          <p className="mt-0.5 text-xs text-stone-400">
            {expanded ? 'Tap to collapse' : 'Tap to see each transaction'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <p
            className={`text-sm font-semibold ${
              isIncome ? 'text-green-600' : isTransfer ? 'text-stone-400' : 'text-stone-800'
            }`}
          >
            {isIncome ? '+' : isTransfer ? '' : '-'}
            {total.toFixed(2)} SGD
          </p>
          <span className={`text-xs text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>
      {expanded && (
        <div className="pl-3 border-l-2 border-stone-100 ml-1 mb-2">
          {txs.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} onCategoryChange={onCategoryChange} />
          ))}
        </div>
      )}
    </div>
  )
}

/** Renders a transaction list, consolidating repeat charges at the same merchant into one expandable row. */
export function MerchantGroupedTransactions({ txs, onCategoryChange }: Props) {
  const groups = new Map<string, Transaction[]>()

  for (const tx of txs) {
    const key = tx.merchant.trim()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }

  return (
    <>
      {[...groups.entries()].map(([merchant, group]) =>
        group.length > 1 ? (
          <MerchantGroup key={merchant} merchant={merchant} txs={group} onCategoryChange={onCategoryChange} />
        ) : (
          <TransactionRow key={group[0].id} tx={group[0]} onCategoryChange={onCategoryChange} />
        )
      )}
    </>
  )
}
