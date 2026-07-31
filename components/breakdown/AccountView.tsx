'use client'

import { useState, useRef, useEffect } from 'react'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import { useCardNicknames } from '@/components/providers/CardNicknamesProvider'
import type { Transaction } from '@/types'

const ACCOUNT_COLOURS = [
  'bg-sky-400', 'bg-violet-400', 'bg-amber-400',
  'bg-teal-400', 'bg-rose-400', 'bg-indigo-400',
]
const ACCOUNT_LIGHT = [
  'bg-sky-50 border-sky-100', 'bg-violet-50 border-violet-100', 'bg-amber-50 border-amber-100',
  'bg-teal-50 border-teal-100', 'bg-rose-50 border-rose-100', 'bg-indigo-50 border-indigo-100',
]

function NicknameEditor({
  accountLast4,
  bankName,
  onSave,
}: {
  accountLast4: string
  bankName: string | null
  onSave: (nickname: string) => void
}) {
  const { nicknames } = useCardNicknames()
  const [value, setValue] = useState(nicknames[accountLast4] ?? bankName ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function save() { onSave(value) }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onSave('') }}
        className="text-sm border border-stone-300 rounded-lg px-2 py-1 w-44 focus:outline-none focus:ring-1 focus:ring-green-500"
        placeholder="Card nickname"
      />
      <button onClick={save} className="text-xs font-medium text-green-600 hover:text-green-700">Save</button>
      <button onClick={() => onSave('')} className="text-xs text-stone-400 hover:text-stone-600">Cancel</button>
    </div>
  )
}

export function AccountView({
  transactions,
  onCategoryChange,
}: {
  transactions: Transaction[]
  onCategoryChange?: (txId: string, category: string) => void | Promise<void>
}) {
  const { nicknames, setNickname, getLabel } = useCardNicknames()
  const [editing, setEditing] = useState<string | null>(null)

  const groups = new Map<string, { bankName: string | null; all: Transaction[] }>()

  for (const tx of transactions) {
    const key = tx.account_last4 ?? 'unknown'
    if (!groups.has(key)) groups.set(key, { bankName: tx.bank_name, all: [] })
    groups.get(key)!.all.push(tx)
  }

  if (groups.size === 0) {
    return <p className="text-sm text-stone-400 py-6 text-center">No transactions to show.</p>
  }

  const accountTotals = [...groups.entries()]
    .map(([key, g]) => {
      const debits = g.all.filter(t => t.type === 'expense' || t.type === 'transfer')
        .reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
      const credits = g.all.filter(t => t.type === 'income')
        .reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
      const hasIncome = g.all.some(t => t.type === 'income')
      return { key, bankName: g.bankName, debits, credits, hasIncome, all: g.all }
    })
    .sort((a, b) => b.debits - a.debits)

  const grandDebits = accountTotals.reduce((s, a) => s + a.debits, 0)

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="rounded-2xl bg-white border border-stone-100 p-4 space-y-3">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Activity by Account</p>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {accountTotals.map(({ key, debits }, i) =>
            grandDebits > 0 ? (
              <button
                key={key}
                onClick={() => document.getElementById(`acct-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className={`${ACCOUNT_COLOURS[i % ACCOUNT_COLOURS.length]} transition-all hover:opacity-80 cursor-pointer`}
                style={{ width: `${(debits / grandDebits) * 100}%` }}
              />
            ) : null
          )}
        </div>
        <div className="space-y-1.5">
          {accountTotals.map(({ key, bankName, debits, credits, hasIncome }, i) => (
            <button
              key={key}
              onClick={() => document.getElementById(`acct-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="flex items-center justify-between w-full hover:opacity-70 transition"
            >
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${ACCOUNT_COLOURS[i % ACCOUNT_COLOURS.length]}`} />
                <span className="text-xs text-stone-700 font-medium">
                  {getLabel(bankName, key === 'unknown' ? null : key)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {hasIncome && <span className="text-xs text-green-600">+{credits.toFixed(0)} in</span>}
                <span className="text-xs font-semibold text-stone-600 w-28 text-right">{debits.toFixed(2)} SGD out</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Per-account lists */}
      {accountTotals.map(({ key, bankName, debits, credits, hasIncome, all }, i) => {
        const label = getLabel(bankName, key === 'unknown' ? null : key)
        return (
          <div key={key} id={`acct-${key}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${ACCOUNT_COLOURS[i % ACCOUNT_COLOURS.length]}`} />
                {editing === key ? (
                  <NicknameEditor
                    accountLast4={key}
                    bankName={bankName}
                    onSave={(nick) => { if (nick) setNickname(key, nick); setEditing(null) }}
                  />
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-stone-700">{label}</h3>
                    <button
                      onClick={() => setEditing(key)}
                      className="text-stone-300 hover:text-stone-500 transition text-xs"
                      title="Edit nickname"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-500">
                {hasIncome && <span className="text-green-600">+{credits.toFixed(2)} in</span>}
                <span>{debits.toFixed(2)} SGD out</span>
              </div>
            </div>
            <div className={`rounded-2xl border px-4 ${ACCOUNT_LIGHT[i % ACCOUNT_LIGHT.length]}`}>
              {all.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} onCategoryChange={onCategoryChange} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
