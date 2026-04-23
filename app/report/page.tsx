'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Transaction, MonthlyReport, SummaryCards, Observation } from '@/types'

const CATEGORY_COLOURS: Record<string, string> = {
  'Food & Dining': '#10b981',
  'Transport': '#0ea5e9',
  'Shopping': '#8b5cf6',
  'Utilities': '#f59e0b',
  'Entertainment': '#ec4899',
  'Health': '#14b8a6',
  'Travel': '#f97316',
  'Other': '#6366f1',
  'Uncategorised': '#a8a29e',
}

function colourFor(cat: string, idx: number) {
  if (CATEGORY_COLOURS[cat]) return CATEGORY_COLOURS[cat]
  const fallbacks = ['#10b981','#0ea5e9','#8b5cf6','#f59e0b','#ec4899','#14b8a6','#f97316','#6366f1','#a8a29e']
  return fallbacks[idx % fallbacks.length]
}

function fmtAmount(n: number) {
  return `SGD ${n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function monthLabel(m: string) {
  const [y, mo] = m.split('-')
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })
}

function ReportContent() {
  const params = useSearchParams()
  const month = params.get('month') ?? new Date().toISOString().slice(0, 7)

  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [rRes, tRes] = await Promise.all([
        fetch(`/api/reports?month=${month}`),
        fetch(`/api/transactions?month=${month}`),
      ])

      if (rRes.status === 401 || tRes.status === 401) {
        setError('You need to be signed in to view this report.')
        setLoading(false)
        return
      }

      const rData = await rRes.json()
      const tData = await tRes.json()

      if (!rData.empty && !rData.error) setReport(rData)
      if (Array.isArray(tData)) setTransactions(tData)
    } catch {
      setError('Failed to load report data.')
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => { load() }, [load])

  // Force light mode on this page — dark class may be on <html>
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    return () => {
      // Restore from localStorage on unmount
      if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-stone-400 text-sm">
        Preparing report…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-stone-500 text-sm">
        {error}
      </div>
    )
  }

  const expenses = transactions.filter((t) => t.type === 'expense')
  const income = transactions.filter((t) => t.type === 'income' && t.claude_category !== 'Refund & Reversal')
  const totalSpent = expenses.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
  const totalSaved = income.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)

  const categoryMap = new Map<string, Transaction[]>()
  for (const tx of expenses) {
    const cat = tx.user_category ?? tx.claude_category ?? 'Uncategorised'
    if (!categoryMap.has(cat)) categoryMap.set(cat, [])
    categoryMap.get(cat)!.push(tx)
  }
  const categories = [...categoryMap.entries()]
    .map(([cat, txs]) => ({ cat, total: txs.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0), txs }))
    .sort((a, b) => b.total - a.total)

  const summaryCards = report?.summary_cards_json as SummaryCards | null
  const hasData = transactions.length > 0 || report !== null

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 18mm 16mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        body { font-family: Georgia, serif; color: #1c1917; background: white; }
      `}</style>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-stone-800 pb-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-1">FinClarity</p>
            <h1 className="text-2xl font-bold text-stone-900">Monthly Report</h1>
            <p className="text-stone-500 text-sm mt-0.5">{monthLabel(month)}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print text-xs border border-stone-300 rounded-lg px-3 py-1.5 text-stone-600 hover:bg-stone-50 transition"
          >
            Save as PDF
          </button>
        </div>

        {!hasData ? (
          <p className="text-stone-400 text-sm py-10 text-center">No data found for {monthLabel(month)}.</p>
        ) : (
          <>
            {/* Narrative */}
            {report?.narrative_text && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Monthly Summary</h2>
                <p className="text-stone-700 leading-relaxed text-sm">{report.narrative_text}</p>
              </section>
            )}

            {/* Totals */}
            <section className="grid grid-cols-3 gap-4 border-t border-b border-stone-200 py-4">
              {[
                { label: 'Total Spent', value: fmtAmount(totalSpent) },
                { label: 'Total Saved', value: fmtAmount(totalSaved) },
                { label: 'Top Category', value: summaryCards?.top_category ?? categories[0]?.cat ?? '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-wide text-stone-400 mb-0.5">{label}</p>
                  <p className="text-base font-semibold text-stone-800">{value}</p>
                </div>
              ))}
            </section>

            {/* Category chart */}
            {categories.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Spending by Category</h2>
                <div className="flex h-4 rounded-full overflow-hidden mb-4" style={{ gap: '2px' }}>
                  {categories.map(({ cat, total }, i) => (
                    <div
                      key={cat}
                      style={{ width: `${(total / totalSpent) * 100}%`, backgroundColor: colourFor(cat, i), minWidth: total > 0 ? '2px' : 0 }}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  {categories.map(({ cat, total }, i) => {
                    const pct = totalSpent > 0 ? (total / totalSpent) * 100 : 0
                    const colour = colourFor(cat, i)
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colour }} />
                        <span className="text-sm text-stone-700 w-40 truncate">{cat}</span>
                        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colour }} />
                        </div>
                        <span className="text-xs text-stone-400 w-8 text-right">{pct.toFixed(0)}%</span>
                        <span className="text-xs font-medium text-stone-700 w-24 text-right">{fmtAmount(total)}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Observations */}
            {Array.isArray(report?.observations_json) && (report.observations_json as Observation[]).length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Observations</h2>
                <ul className="space-y-1.5">
                  {(report.observations_json as Observation[]).map((obs, i) => (
                    <li key={i} className="text-sm text-stone-700 flex gap-2">
                      <span className="text-stone-300 shrink-0">–</span>
                      <span>{obs.message}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Transaction list */}
            {categories.map(({ cat, txs }, i) => (
              <section key={cat}>
                <div className="flex items-center gap-2 mb-2 border-b border-stone-100 pb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colourFor(cat, i) }} />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{cat}</h3>
                  <span className="ml-auto text-xs text-stone-400">
                    {fmtAmount(txs.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0))}
                  </span>
                </div>
                {txs.sort((a, b) => b.date.localeCompare(a.date)).map((tx) => (
                  <div key={tx.id} className="flex justify-between py-1.5 border-b border-stone-50 text-sm">
                    <div className="flex gap-3 min-w-0">
                      <span className="text-stone-400 shrink-0 text-xs pt-0.5">
                        {new Date(tx.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-stone-700 truncate">{tx.merchant}</span>
                    </div>
                    <span className="text-stone-800 font-medium shrink-0 ml-4">
                      -{fmtAmount(tx.sgd_amount ?? tx.amount)}
                    </span>
                  </div>
                ))}
              </section>
            ))}
          </>
        )}

        {/* Footer */}
        <div className="border-t border-stone-200 pt-4 text-center">
          <p className="text-xs text-stone-300">
            Generated by FinClarity · {new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen text-stone-400 text-sm">
        Preparing report…
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}
