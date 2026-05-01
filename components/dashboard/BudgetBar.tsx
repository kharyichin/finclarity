'use client'

import Link from 'next/link'
import { BudgetCallouts } from './BudgetCallouts'

interface Props {
  spent: number | null
  monthlyBudget: number | null
  categoryBudgets: Record<string, number> | null
  month: string
}

export function BudgetBar({ spent, monthlyBudget, categoryBudgets, month }: Props) {
  const categorySum = categoryBudgets
    ? Object.values(categoryBudgets).filter((v) => v > 0).reduce((s, v) => s + v, 0)
    : 0

  const target = categorySum > 0 ? categorySum : (monthlyBudget ?? null)

  if (target == null || target === 0) {
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
  const pct = Math.round((spentAmt / target) * 100)
  const displayPct = Math.min(pct, 100)
  const over = spentAmt > target

  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-400' : 'bg-green-500'
  const statusColor = over ? 'text-red-500' : 'text-stone-500'

  const fmt = (n: number) =>
    'SGD ' + Math.abs(n).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const label = categorySum > 0 ? 'Monthly budget' : 'Overall budget'
  const statusText = over
    ? `Over by ${fmt(spentAmt - target)} — you budgeted ${fmt(target)}`
    : `${fmt(spentAmt)} of ${fmt(target)} (${pct}%)`

  const hasCategoryBudgets = categoryBudgets != null && Object.keys(categoryBudgets).length > 0

  return (
    <div className="rounded-2xl bg-white border border-stone-100 px-5 py-4 space-y-2.5">
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

      {hasCategoryBudgets && (
        <BudgetCallouts month={month} categoryBudgets={categoryBudgets!} />
      )}
    </div>
  )
}
