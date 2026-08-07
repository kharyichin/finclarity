'use client'

import { MerchantGroupedTransactions } from '@/components/transactions/MerchantGroupedTransactions'
import { getCategoryIcon } from '@/lib/utils/categories'
import type { Transaction } from '@/types'

const CATEGORY_COLOURS = [
  'bg-emerald-400',
  'bg-sky-400',
  'bg-violet-400',
  'bg-amber-400',
  'bg-rose-400',
  'bg-teal-400',
  'bg-orange-400',
  'bg-indigo-400',
  'bg-pink-400',
  'bg-lime-400',
]

const CATEGORY_LIGHT = [
  'bg-emerald-50 border-emerald-100',
  'bg-sky-50 border-sky-100',
  'bg-violet-50 border-violet-100',
  'bg-amber-50 border-amber-100',
  'bg-rose-50 border-rose-100',
  'bg-teal-50 border-teal-100',
  'bg-orange-50 border-orange-100',
  'bg-indigo-50 border-indigo-100',
  'bg-pink-50 border-pink-100',
  'bg-lime-50 border-lime-100',
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function slug(s: string) {
  return 'cat-' + s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function CategoryView({
  transactions,
  categoryBudgets = {},
  onCategoryChange,
}: {
  transactions: Transaction[]
  categoryBudgets?: Record<string, number>
  onCategoryChange?: (txId: string, category: string) => void | Promise<void>
}) {
  const groups = new Map<string, Transaction[]>()

  for (const tx of transactions) {
    if (tx.type !== 'expense') continue
    const key = tx.user_category ?? tx.claude_category ?? 'Uncategorised'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }

  const sorted = [...groups.entries()].sort((a, b) => {
    const sumA = a[1].reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
    const sumB = b[1].reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
    return sumB - sumA
  })

  if (sorted.length === 0) {
    return <p className="text-sm text-stone-400 py-6 text-center">No transactions to show.</p>
  }

  const totals = sorted.map(([cat, txs]) => ({
    cat,
    total: txs.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0),
  }))

  const grandTotal = totals.reduce((s, { total }) => s + total, 0)

  return (
    <div className="space-y-6">
      {/* Summary chart */}
      <div className="rounded-2xl bg-white border border-stone-100 p-4 space-y-3">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Spending by Category</p>

        {/* Stacked bar */}
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {totals.map(({ cat, total }, i) => (
            <button
              key={cat}
              onClick={() => scrollTo(slug(cat))}
              className={`${CATEGORY_COLOURS[i % CATEGORY_COLOURS.length]} transition-all hover:opacity-80 cursor-pointer`}
              style={{ width: `${(total / grandTotal) * 100}%` }}
              title={`${cat}: ${total.toFixed(2)} SGD`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {totals.map(({ cat, total }, i) => (
            <button
              key={cat}
              onClick={() => scrollTo(slug(cat))}
              className="flex items-center gap-1.5 hover:opacity-70 transition cursor-pointer"
            >
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${CATEGORY_COLOURS[i % CATEGORY_COLOURS.length]}`} />
              <span>{getCategoryIcon(cat)}</span>
              <span className="text-xs text-stone-600">{cat}</span>
              <span className="text-xs text-stone-400">{((total / grandTotal) * 100).toFixed(0)}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Per-category transaction lists */}
      {sorted.map(([category, txs], i) => {
        const total = totals[i].total
        const pct = ((total / grandTotal) * 100).toFixed(0)
        const budget = categoryBudgets[category]
        const overBudget = budget != null && budget > 0 && total > budget
        const overAmt = overBudget ? total - budget : 0
        return (
          <div key={category} id={slug(category)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${CATEGORY_COLOURS[i % CATEGORY_COLOURS.length]}`} />
                <span>{getCategoryIcon(category)}</span>
                <h3 className="text-sm font-semibold text-stone-700">{category}</h3>
                <span className="text-xs text-stone-400">{pct}%</span>
                {overBudget && (
                  <span className="group relative inline-flex items-center justify-center shrink-0">
                    {/* Pulsing ring */}
                    <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 animate-ping" />
                    {/* Badge */}
                    <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black leading-none">!</span>
                    {/* Tooltip */}
                    <span className="pointer-events-none absolute bottom-full left-0 mb-3 z-50 w-56 max-w-[calc(100vw-2rem)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="block bg-stone-800 text-white text-xs font-medium rounded-xl px-4 py-2.5 shadow-xl">
                        <span className="block text-amber-300 font-semibold mb-0.5">Over budget</span>
                        SGD {overAmt.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} more than planned
                      </span>
                      <span className="block w-2.5 h-2.5 bg-stone-800 rotate-45 -mt-1.5 ml-1.5 rounded-sm" />
                    </span>
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-stone-600">{total.toFixed(2)} SGD</span>
            </div>
            <div className={`rounded-2xl border px-4 ${CATEGORY_LIGHT[i % CATEGORY_LIGHT.length]}`}>
              <MerchantGroupedTransactions txs={txs} onCategoryChange={onCategoryChange} />
            </div>
          </div>
        )
      })}


    </div>
  )
}
