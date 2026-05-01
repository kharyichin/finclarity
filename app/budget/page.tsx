'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { getCategoryIcon } from '@/lib/utils/categories'
import type { Transaction } from '@/types'

const BUDGET_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Utilities',
  'Entertainment',
  'Health',
  'Travel',
  'Other',
]

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function fmt(n: number) {
  return 'SGD ' + n.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function BudgetPage() {
  const [overallBudget, setOverallBudget] = useState('')
  const [budgets, setBudgets] = useState<Record<string, string>>({})
  const [spendByCategory, setSpendByCategory] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [estimateInfo, setEstimateInfo] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [userRes, txRes] = await Promise.all([
        fetch('/api/user'),
        fetch(`/api/transactions?month=${getCurrentMonth()}`),
      ])
      const user = userRes.ok ? await userRes.json() : {}
      const transactions: Transaction[] = txRes.ok ? await txRes.json() : []

      setOverallBudget(user.monthly_budget != null ? String(user.monthly_budget) : '')

      const existing: Record<string, number> = user.category_budgets ?? {}
      const initial: Record<string, string> = {}
      for (const cat of BUDGET_CATEGORIES) {
        initial[cat] = existing[cat] != null ? String(existing[cat]) : ''
      }
      setBudgets(initial)

      const spend: Record<string, number> = {}
      for (const tx of transactions) {
        if (tx.type !== 'expense') continue
        const cat = tx.claude_category ?? 'Other'
        spend[cat] = (spend[cat] ?? 0) + (tx.sgd_amount ?? tx.amount)
      }
      setSpendByCategory(spend)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleEstimate() {
    setEstimating(true)
    setEstimateInfo(null)
    try {
      const res = await fetch('/api/budget/estimate')
      if (!res.ok) return
      const { estimates, monthsAnalyzed } = await res.json()
      if (monthsAnalyzed === 0) {
        setEstimateInfo('Not enough data yet — upload more statements to get AI estimates.')
        return
      }
      setBudgets((prev) => {
        const next = { ...prev }
        for (const cat of BUDGET_CATEGORIES) {
          if (estimates[cat] != null) next[cat] = String(estimates[cat])
        }
        return next
      })
      setSaved(false)
      setEstimateInfo(`Estimated from ${monthsAnalyzed} month${monthsAnalyzed > 1 ? 's' : ''} of spending. Adjust before saving.`)
    } finally {
      setEstimating(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    const categoryPayload: Record<string, number> = {}
    for (const [cat, raw] of Object.entries(budgets)) {
      const val = parseFloat(raw)
      if (!isNaN(val) && val > 0) categoryPayload[cat] = val
    }

    // Overall = sum of categories if any exist, otherwise use the manual overall input
    const computedTotal = Object.values(categoryPayload).reduce((s, v) => s + v, 0)
    const manualOverall = parseFloat(overallBudget)
    const monthlyBudgetVal = computedTotal > 0
      ? computedTotal
      : (!isNaN(manualOverall) && manualOverall > 0 ? manualOverall : null)

    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthly_budget: monthlyBudgetVal,
          category_budgets: categoryPayload,
        }),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  // Live sum of category inputs — drives what the overall field shows
  const categoryTotal = Object.values(budgets).reduce((sum, v) => {
    const n = parseFloat(v)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)
  const hasCategories = categoryTotal > 0

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-lg mx-auto space-y-6">

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-stone-800">Monthly budgets</h1>
                <p className="text-sm text-stone-400 mt-1">
                  Set an overall cap, category limits, or both. Category budgets always determine the overall.
                </p>
              </div>
              <button
                onClick={handleEstimate}
                disabled={estimating || loading}
                className="shrink-0 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition flex items-center gap-1.5"
              >
                {estimating ? (
                  <><span className="animate-spin text-xs">⟳</span> Estimating…</>
                ) : (
                  <>✦ Suggest with AI</>
                )}
              </button>
            </div>

            {estimateInfo && (
              <p className="text-xs text-stone-400 -mt-2">{estimateInfo}</p>
            )}

            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 rounded-2xl bg-stone-100" />
                {BUDGET_CATEGORIES.map((cat) => (
                  <div key={cat} className="h-14 rounded-2xl bg-stone-100" />
                ))}
              </div>
            ) : (
              <>
                {/* Overall budget */}
                <div className="rounded-2xl bg-white border border-stone-100 px-5 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-stone-700">Overall monthly budget</p>
                    {hasCategories && (
                      <span className="text-xs text-stone-400 bg-stone-50 rounded-full px-2.5 py-0.5">
                        Computed from categories
                      </span>
                    )}
                  </div>

                  {hasCategories ? (
                    <p className="text-2xl font-semibold text-stone-800">{fmt(categoryTotal)}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-400 shrink-0">SGD</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={overallBudget}
                        placeholder="e.g. 3,000"
                        onChange={(e) => {
                          setOverallBudget(e.target.value.replace(/[^0-9.]/g, ''))
                          setSaved(false)
                        }}
                        className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
                      />
                    </div>
                  )}

                  {!hasCategories && (
                    <p className="text-xs text-stone-400">
                      No category budgets set — this cap applies across all spending.
                    </p>
                  )}
                </div>

                {/* Category budgets */}
                <div>
                  <p className="text-sm font-medium text-stone-700 mb-3">Category budgets</p>
                  <div className="space-y-2">
                    {BUDGET_CATEGORIES.map((cat) => {
                      const spent = spendByCategory[cat] ?? 0
                      const budgetVal = parseFloat(budgets[cat] ?? '')
                      const hasBudget = !isNaN(budgetVal) && budgetVal > 0
                      const hasValue = (budgets[cat] ?? '').trim() !== ''
                      const over = hasBudget && spent > budgetVal
                      const pct = hasBudget ? Math.min(Math.round((spent / budgetVal) * 100), 100) : 0

                      return (
                        <div key={cat} className="rounded-2xl bg-white border border-stone-100 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg shrink-0">{getCategoryIcon(cat)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-stone-700 truncate">{cat}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-xs text-stone-400">SGD</span>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      value={budgets[cat] ?? ''}
                                      placeholder="1,000"
                                      onChange={(e) => {
                                        setBudgets((prev) => ({ ...prev, [cat]: e.target.value.replace(/[^0-9.]/g, '') }))
                                        setSaved(false)
                                      }}
                                      className={`w-24 rounded-lg border border-stone-200 px-2.5 py-1 text-sm text-right text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 ${hasValue ? 'pr-6' : ''}`}
                                    />
                                    {hasValue && (
                                      <button
                                        onClick={() => { setBudgets((prev) => ({ ...prev, [cat]: '' })); setSaved(false) }}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 text-xs leading-none"
                                        aria-label={`Clear ${cat} budget`}
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {(hasBudget || spent > 0) && (
                                <div className="mt-2 space-y-1">
                                  {hasBudget && (
                                    <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${over ? 'bg-red-400' : pct >= 80 ? 'bg-amber-400' : 'bg-green-400'}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  )}
                                  <p className={`text-xs ${over ? 'text-red-500' : 'text-stone-400'}`}>
                                    {fmt(spent)} spent{hasBudget ? (over ? ' · over budget' : ` · ${pct}%`) : ''}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-stone-500">
                    {hasCategories
                      ? `Total: ${fmt(categoryTotal)} / month`
                      : overallBudget
                      ? `Overall: ${fmt(parseFloat(overallBudget) || 0)} / month`
                      : 'No budgets set yet'}
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-stone-800 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50 transition"
                  >
                    {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save budgets'}
                  </button>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
