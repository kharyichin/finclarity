'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  spent: number | null
  budget: number | null
  onBudgetChange: (budget: number | null) => void
}

export function BudgetBar({ spent, budget, onBudgetChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setInputValue(budget != null ? String(budget) : '')
      inputRef.current?.focus()
    }
  }, [editing, budget])

  async function save() {
    setSaving(true)
    const raw = inputValue.trim()
    const parsed = raw === '' ? null : Number(raw)
    if (parsed !== null && (isNaN(parsed) || parsed < 0)) {
      setSaving(false)
      return
    }
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthly_budget: parsed }),
      })
      if (res.ok) {
        onBudgetChange(parsed)
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-2xl bg-white border border-stone-100 px-5 py-4">
        <p className="text-xs text-stone-400 mb-2">Monthly budget (SGD)</p>
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="number"
            min="0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 3000"
            className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-stone-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50 transition"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-stone-400 hover:text-stone-600"
          >
            Cancel
          </button>
        </div>
        {budget != null && (
          <button
            onClick={() => { setInputValue(''); save() }}
            className="mt-2 text-xs text-stone-400 hover:text-red-500 transition"
          >
            Remove budget
          </button>
        )}
      </div>
    )
  }

  if (budget == null) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full text-left rounded-2xl bg-white border border-stone-100 px-5 py-4 text-sm text-stone-400 hover:text-stone-600 hover:border-stone-200 transition"
      >
        Set a monthly budget →
      </button>
    )
  }

  const spentAmt = spent ?? 0
  const pct = Math.min(Math.round((spentAmt / budget) * 100), 999)
  const displayPct = Math.min(pct, 100)

  let barColor = 'bg-green-500'
  let textColor = 'text-green-700'
  if (pct >= 100) { barColor = 'bg-red-500'; textColor = 'text-red-600' }
  else if (pct >= 80) { barColor = 'bg-amber-400'; textColor = 'text-amber-700' }

  const fmt = (n: number) =>
    'SGD ' + Math.abs(n).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className="rounded-2xl bg-white border border-stone-100 px-5 py-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-400">Monthly budget</p>
          <p className="text-sm font-semibold text-stone-800">{fmt(budget)}</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-stone-400 hover:text-stone-600 transition"
        >
          Edit
        </button>
      </div>

      <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${displayPct}%` }}
        />
      </div>

      <p className={`text-xs ${textColor}`}>
        {pct >= 100
          ? `${pct - 100}% over budget — ${fmt(spentAmt - budget)} over`
          : `${pct}% of budget used — ${fmt(budget - spentAmt)} remaining`}
      </p>
    </div>
  )
}
