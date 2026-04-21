'use client'

import { formatTransaction } from '@/lib/utils/currency'
import { getCategoryIcon } from '@/lib/utils/categories'
import type { Transaction } from '@/types'

export function TransactionRow({ tx }: { tx: Transaction }) {
  const { primaryDisplay, secondaryDisplay, rateAttribution } = formatTransaction(tx)
  const category = tx.user_category ?? tx.claude_category ?? 'Uncategorised'
  const isIncome = tx.type === 'income'
  const isTransfer = tx.type === 'transfer' || tx.type === 'internal_transfer'

  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-stone-800 truncate">{tx.merchant}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-stone-400">
            {new Date(tx.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
          </span>
          <span className="text-xs text-stone-300">·</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
            <span>{getCategoryIcon(category)}</span>
            <span>{category}</span>
          </span>
          {tx.bank_name && (
            <>
              <span className="text-xs text-stone-300">·</span>
              <span className="text-xs text-stone-400">{tx.bank_name} ···{tx.account_last4}</span>
            </>
          )}
        </div>
        {rateAttribution && (
          <p className="text-xs text-stone-400 mt-0.5 italic">{rateAttribution}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-semibold ${
          isIncome ? 'text-green-600' : isTransfer ? 'text-stone-400' : 'text-stone-800'
        }`}>
          {isIncome ? '+' : isTransfer ? '' : '-'}{primaryDisplay}
        </p>
        {secondaryDisplay && (
          <p className="text-xs text-stone-400">{secondaryDisplay}</p>
        )}
      </div>
    </div>
  )
}
