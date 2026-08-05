'use client'

import { useState } from 'react'
import { formatTransaction } from '@/lib/utils/currency'
import {
  CATEGORY_OPTIONS,
  effectiveCategory,
  getCategoryIcon,
  needsCategoryReview,
} from '@/lib/utils/categories'
import { useCardNicknames } from '@/components/providers/CardNicknamesProvider'
import { parseLocalDate } from '@/lib/utils/dates'
import type { Transaction } from '@/types'

interface Props {
  tx: Transaction
  /** When provided, category becomes editable. */
  onCategoryChange?: (txId: string, category: string) => void | Promise<void>
}

export function TransactionRow({ tx, onCategoryChange }: Props) {
  const { getLabel } = useCardNicknames()
  const { primaryDisplay, secondaryDisplay, rateAttribution } = formatTransaction(tx)
  const category = effectiveCategory(tx)
  const review = needsCategoryReview(tx)
  const isIncome = tx.type === 'income'
  const isTransfer = tx.type === 'transfer' || tx.type === 'internal_transfer'
  const [saving, setSaving] = useState(false)

  async function handleChange(next: string) {
    if (!onCategoryChange || next === category || saving) return
    setSaving(true)
    try {
      await onCategoryChange(tx.id, next)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-stone-100 py-3 last:border-0">
      <div className="min-w-0 flex-1 pr-2">
        <p className="truncate text-sm font-medium text-stone-800">{tx.merchant}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-400">
            {parseLocalDate(tx.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
          </span>
          <span className="text-xs text-stone-300">·</span>

          {onCategoryChange ? (
            <label className="relative inline-flex max-w-full items-center">
              <select
                value={CATEGORY_OPTIONS.includes(category as (typeof CATEGORY_OPTIONS)[number]) ? category : 'Other'}
                disabled={saving}
                onChange={(e) => handleChange(e.target.value)}
                aria-label={`Category for ${tx.merchant}`}
                className={`appearance-none rounded-full border py-0.5 pl-2 pr-6 text-xs transition focus:outline-none focus:ring-1 focus:ring-stone-300 disabled:opacity-60 ${
                  review
                    ? 'border-amber-300 bg-amber-50 font-medium text-amber-900'
                    : 'border-stone-200 bg-stone-100 text-stone-600'
                }`}
              >
                {/* Keep current label if not in list (e.g. Uncategorised display) */}
                {!CATEGORY_OPTIONS.includes(category as (typeof CATEGORY_OPTIONS)[number]) && (
                  <option value={category === 'Uncategorised' ? 'Other' : category}>
                    {getCategoryIcon(category)} {category}
                  </option>
                )}
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {getCategoryIcon(opt)} {opt}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-1.5 text-[10px] text-stone-400">▾</span>
            </label>
          ) : (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                review ? 'bg-amber-50 text-amber-800' : 'bg-stone-100 text-stone-500'
              }`}
            >
              <span>{getCategoryIcon(category)}</span>
              <span>{category}</span>
            </span>
          )}

          {tx.account_last4 && (
            <>
              <span className="text-xs text-stone-300">·</span>
              <span className="text-xs text-stone-400">{getLabel(tx.bank_name, tx.account_last4)}</span>
            </>
          )}
        </div>
        {rateAttribution && (
          <p className="mt-0.5 text-xs italic text-stone-400">{rateAttribution}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p
          className={`text-sm font-semibold ${
            isIncome ? 'text-green-600' : isTransfer ? 'text-stone-400' : 'text-stone-800'
          }`}
        >
          {isIncome ? '+' : isTransfer ? '' : '-'}
          {primaryDisplay}
        </p>
        {secondaryDisplay && <p className="text-xs text-stone-400">{secondaryDisplay}</p>}
      </div>
    </div>
  )
}
