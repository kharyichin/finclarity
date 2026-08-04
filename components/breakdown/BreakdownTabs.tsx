'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { CategoryView } from './CategoryView'
import { AccountView } from './AccountView'
import { TypeView } from './TypeView'
import { TimeView } from './TimeView'
import { needsCategoryReview } from '@/lib/utils/categories'
import type { Transaction } from '@/types'

const tabs = [
  { id: 'category', label: 'By Category' },
  { id: 'account', label: 'By Account' },
  { id: 'type', label: 'By Type' },
  { id: 'time', label: 'By Date' },
]

function accountLabel(tx: Transaction) {
  if (!tx.account_last4) return null
  const bankPrefix = tx.bank_name?.trim().split(/\s+/)[0] ?? ''
  return bankPrefix ? `${bankPrefix} ···${tx.account_last4}` : `···${tx.account_last4}`
}

export function BreakdownTabs({
  transactions,
  month,
  categoryBudgets = {},
  onTransactionsChange,
}: {
  transactions: Transaction[]
  month: string
  categoryBudgets?: Record<string, number>
  /** Optional lift so parent can stay in sync after edits */
  onTransactionsChange?: (next: Transaction[]) => void
}) {
  const [active, setActive] = useState('category')
  const [filterAccount, setFilterAccount] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [needsReviewOnly, setNeedsReviewOnly] = useState(false)
  const [localTxs, setLocalTxs] = useState(transactions)

  useEffect(() => {
    setLocalTxs(transactions)
  }, [transactions])

  const reviewCount = useMemo(
    () => localTxs.filter((tx) => needsCategoryReview(tx)).length,
    [localTxs],
  )

  const handleCategoryChange = useCallback(
    async (txId: string, category: string) => {
      const prev = localTxs
      const optimistic = prev.map((tx) =>
        tx.id === txId ? { ...tx, user_category: category } : tx,
      )
      setLocalTxs(optimistic)
      onTransactionsChange?.(optimistic)

      try {
        const res = await fetch('/api/transactions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: txId, user_category: category }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update category')
        }
        const confirmed = optimistic.map((tx) => (tx.id === txId ? { ...tx, ...data } : tx))
        setLocalTxs(confirmed)
        onTransactionsChange?.(confirmed)
      } catch (err) {
        setLocalTxs(prev)
        onTransactionsChange?.(prev)
        console.error(err)
        alert(err instanceof Error ? err.message : 'Could not save category')
      }
    },
    [localTxs, onTransactionsChange],
  )

  const accounts = useMemo(() => {
    const seen = new Map<string, string>()
    for (const tx of localTxs) {
      if (tx.account_last4 && !seen.has(tx.account_last4)) {
        seen.set(tx.account_last4, accountLabel(tx) ?? `···${tx.account_last4}`)
      }
    }
    return [...seen.entries()].map(([value, label]) => ({ value, label }))
  }, [localTxs])

  const categories = useMemo(() => {
    const seen = new Set<string>()
    for (const tx of localTxs) {
      const cat = tx.user_category || tx.claude_category
      if (cat) seen.add(cat)
    }
    return [...seen].sort()
  }, [localTxs])

  const filtered = useMemo(() => {
    return localTxs.filter((tx) => {
      if (needsReviewOnly && !needsCategoryReview(tx)) return false
      if (filterAccount !== 'all' && tx.account_last4 !== filterAccount) return false
      if (filterCategory !== 'all') {
        const cat = tx.user_category || tx.claude_category
        if (cat !== filterCategory) return false
      }
      return true
    })
  }, [localTxs, filterAccount, filterCategory, needsReviewOnly])

  const hasFilter = filterAccount !== 'all' || filterCategory !== 'all' || needsReviewOnly

  function clearFilters() {
    setFilterAccount('all')
    setFilterCategory('all')
    setNeedsReviewOnly(false)
  }

  return (
    <div>
      {/* Review banner */}
      {reviewCount > 0 && (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-amber-900">
              {reviewCount} transaction{reviewCount === 1 ? '' : 's'} need a category check
            </p>
            <p className="mt-0.5 text-xs text-amber-800/80">
              Marked Other or uncategorised — pick a better label from the row.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setNeedsReviewOnly(true)
              setActive('category')
            }}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              needsReviewOnly
                ? 'bg-amber-900 text-white'
                : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            {needsReviewOnly ? 'Showing review only' : 'Review now'}
          </button>
        </div>
      )}

      {/* Filter bar */}
      {(accounts.length > 1 || categories.length > 0 || reviewCount > 0) && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {accounts.length > 1 && (
            <div className="relative">
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className={`cursor-pointer appearance-none rounded-xl border py-1.5 pl-3 pr-8 text-sm transition focus:outline-none focus:ring-1 focus:ring-stone-300 ${
                  filterAccount !== 'all'
                    ? 'border-stone-400 bg-stone-100 font-medium text-stone-800'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <option value="all">All accounts</option>
                {accounts.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                ▾
              </span>
            </div>
          )}

          {categories.length > 0 && (
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`cursor-pointer appearance-none rounded-xl border py-1.5 pl-3 pr-8 text-sm transition focus:outline-none focus:ring-1 focus:ring-stone-300 ${
                  filterCategory !== 'all'
                    ? 'border-stone-400 bg-stone-100 font-medium text-stone-800'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                ▾
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setNeedsReviewOnly((v) => !v)}
            className={`rounded-xl border px-3 py-1.5 text-sm transition ${
              needsReviewOnly
                ? 'border-amber-400 bg-amber-50 font-medium text-amber-900'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
            }`}
          >
            Needs review{reviewCount > 0 ? ` (${reviewCount})` : ''}
          </button>

          {hasFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-500 transition hover:bg-stone-200"
            >
              Clear ×
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-stone-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              active === tab.id
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'category' && (
        <CategoryView
          transactions={filtered}
          categoryBudgets={categoryBudgets}
          onCategoryChange={handleCategoryChange}
        />
      )}
      {active === 'account' && (
        <AccountView transactions={filtered} onCategoryChange={handleCategoryChange} />
      )}
      {active === 'type' && (
        <TypeView transactions={filtered} onCategoryChange={handleCategoryChange} />
      )}
      {active === 'time' && (
        <TimeView transactions={filtered} month={month} onCategoryChange={handleCategoryChange} />
      )}
    </div>
  )
}
