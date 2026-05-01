'use client'

import { useState, useMemo } from 'react'
import { CategoryView } from './CategoryView'
import { AccountView } from './AccountView'
import { TypeView } from './TypeView'
import { TimeView } from './TimeView'
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
}: {
  transactions: Transaction[]
  month: string
  categoryBudgets?: Record<string, number>
}) {
  const [active, setActive] = useState('category')
  const [filterAccount, setFilterAccount] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  const accounts = useMemo(() => {
    const seen = new Map<string, string>()
    for (const tx of transactions) {
      if (tx.account_last4 && !seen.has(tx.account_last4)) {
        seen.set(tx.account_last4, accountLabel(tx) ?? `···${tx.account_last4}`)
      }
    }
    return [...seen.entries()].map(([value, label]) => ({ value, label }))
  }, [transactions])

  const categories = useMemo(() => {
    const seen = new Set<string>()
    for (const tx of transactions) {
      const cat = tx.user_category || tx.claude_category
      if (cat) seen.add(cat)
    }
    return [...seen].sort()
  }, [transactions])

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterAccount !== 'all' && tx.account_last4 !== filterAccount) return false
      if (filterCategory !== 'all') {
        const cat = tx.user_category || tx.claude_category
        if (cat !== filterCategory) return false
      }
      return true
    })
  }, [transactions, filterAccount, filterCategory])

  const hasFilter = filterAccount !== 'all' || filterCategory !== 'all'

  function clearFilters() {
    setFilterAccount('all')
    setFilterCategory('all')
  }

  return (
    <div>
      {/* Filter bar */}
      {(accounts.length > 1 || categories.length > 0) && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {accounts.length > 1 && (
            <div className="relative">
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className={`appearance-none rounded-xl pl-3 pr-8 py-1.5 text-sm border focus:outline-none focus:ring-1 focus:ring-green-400 transition cursor-pointer ${
                  filterAccount !== 'all'
                    ? 'border-green-300 bg-green-50 text-green-700 font-medium'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <option value="all">All accounts</option>
                {accounts.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">▾</span>
            </div>
          )}

          {categories.length > 0 && (
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`appearance-none rounded-xl pl-3 pr-8 py-1.5 text-sm border focus:outline-none focus:ring-1 focus:ring-green-400 transition cursor-pointer ${
                  filterCategory !== 'all'
                    ? 'border-green-300 bg-green-50 text-green-700 font-medium'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">▾</span>
            </div>
          )}

          {hasFilter && (
            <button
              onClick={clearFilters}
              className="rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 text-xs px-3 py-1.5 transition"
            >
              Clear ×
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
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

      {active === 'category' && <CategoryView transactions={filtered} categoryBudgets={categoryBudgets} />}
      {active === 'account' && <AccountView transactions={filtered} />}
      {active === 'type' && <TypeView transactions={filtered} />}
      {active === 'time' && <TimeView transactions={filtered} month={month} />}
    </div>
  )
}
