'use client'

import Link from 'next/link'

interface Props {
  spent: number | null
  monthlyBudget: number | null
  categoryBudgets: Record<string, number> | null
}

export function BudgetBar({ spent, monthlyBudget, categoryBudgets }: Props) {
  const categoryTotal = categoryBudgets
    ? Object.values(categoryBudgets).filter((v) => v > 0).reduce((s, v) => s + v, 0)
    : 0

  const target = monthlyBudget ?? (categoryTotal > 0 ? categoryTotal : null)

  if (target == null) {
    return (
      <Link
        href="/budget"
        className="block w-full rounded-2xl bg-white border border-stone-100 px-5 py-3 text-sm text-stone-400 hover:text-stone-600 hover:border-stone-200 transition"
      >
        Set monthly budgets →
      </Link>
    )
  }

  const spentAmt = spent ?? 0
  const pct = target > 0 ? Math.round((spentAmt / target) * 100) : 0
  const displayPct = Math.min(pct, 100)
  const over = spentAmt > target

  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-400' : 'bg-green-500'
  const statusColor = over ? 'text-red-600' : 'text-stone-500'

  const fmt = (n: number) =>
    'SGD ' + Math.abs(n).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const label = monthlyBudget != null ? 'Monthly budget' : 'Category budgets'
  const statusText = over
    ? `${fmt(spentAmt - target)} over budget · ${fmt(spentAmt)} of ${fmt(target)}`
    : `${fmt(spentAmt)} of ${fmt(target)} (${pct}%)`

  return (
    <div className="rounded-2xl bg-white border border-stone-100 px-5 py-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <Link href="/budget" className="text-xs text-stone-400 hover:text-stone-600 transition">
          Edit →
        </Link>
      </div>

      <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${displayPct}%` }}
        />
      </div>

      <p className={`text-xs ${statusColor}`}>{statusText}</p>
    </div>
  )
}
