'use client'

import { useState, useEffect } from 'react'
import { getCardLabel } from '@/lib/utils/cardNicknames'
import type { Transaction } from '@/types'

interface CardSpend {
  bankName: string | null
  accountLast4: string | null
  total: number
}

interface Props {
  month: string
  isAnonymous: boolean
}

function computeFromTransactions(
  expenses: { bankName: string | null; accountLast4: string | null; amount: number }[]
): { top: CardSpend | null; count: number } {
  const totals = new Map<string, CardSpend>()

  for (const tx of expenses) {
    const key = `${tx.bankName ?? ''}|${tx.accountLast4 ?? ''}`
    const existing = totals.get(key)
    if (existing) {
      existing.total += tx.amount
    } else {
      totals.set(key, { bankName: tx.bankName, accountLast4: tx.accountLast4, total: tx.amount })
    }
  }

  const entries = [...totals.values()]
  if (entries.length < 2) return { top: null, count: entries.length }

  entries.sort((a, b) => b.total - a.total)
  return { top: entries[0], count: entries.length }
}

export function InsightTiles({ month, isAnonymous }: Props) {
  const [topCard, setTopCard] = useState<CardSpend | null>(null)
  const [totalCards, setTotalCards] = useState(0)

  useEffect(() => {
    setTopCard(null)
    setTotalCards(0)

    if (isAnonymous) {
      const pending = sessionStorage.getItem('finclarity_pending_upload')
      if (!pending) return
      try {
        const parsed = JSON.parse(pending)
        const rawTransactions: Array<{ type: string; amount: number; accountLast4: string }> =
          parsed.rawTransactions ?? []
        const bankName: string | null = parsed.meta?.bankName ?? null
        const expenses = rawTransactions
          .filter((tx) => tx.type === 'expense')
          .map((tx) => ({ bankName, accountLast4: tx.accountLast4 ?? null, amount: tx.amount }))
        const { top, count } = computeFromTransactions(expenses)
        setTopCard(top)
        setTotalCards(count)
      } catch { /* ignore */ }
      return
    }

    fetch(`/api/transactions?month=${month}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((transactions: Transaction[]) => {
        const expenses = transactions
          .filter((tx) => tx.type === 'expense')
          .map((tx) => ({
            bankName: tx.bank_name,
            accountLast4: tx.account_last4,
            amount: tx.sgd_amount ?? tx.amount,
          }))
        const { top, count } = computeFromTransactions(expenses)
        setTopCard(top)
        setTotalCards(count)
      })
      .catch(() => {})
  }, [month, isAnonymous])

  if (!topCard || totalCards < 2) return null

  const label = getCardLabel(topCard.bankName, topCard.accountLast4)
  const amount = 'SGD ' + topCard.total.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className="flex gap-3">
      <div className="rounded-2xl bg-white border border-stone-100 px-4 py-3 shadow-sm">
        <p className="text-xs text-stone-400 mb-1">Top card</p>
        <p className="text-sm font-semibold text-stone-800">{label} — {amount}</p>
        <p className="text-xs text-stone-400 mt-0.5">of {totalCards} cards this month</p>
      </div>
    </div>
  )
}
