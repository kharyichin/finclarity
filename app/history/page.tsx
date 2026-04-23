'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import type { Statement } from '@/types'

interface StatementWithAccounts extends Statement {
  accounts?: Array<{ last4: string; bank_name: string | null }>
}

const STATUS_LABELS: Record<string, { label: string; colour: string }> = {
  complete: { label: 'Complete', colour: 'text-green-600 bg-green-50' },
  processing: { label: 'Processing', colour: 'text-amber-600 bg-amber-50' },
  needs_password: { label: 'Needs password', colour: 'text-amber-600 bg-amber-50' },
  failed: { label: 'Failed', colour: 'text-rose-600 bg-rose-50' },
}

export default function HistoryPage() {
  const [statements, setStatements] = useState<StatementWithAccounts[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/statements')
        if (res.ok) setStatements(await res.json())
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    load()
  }, [])

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/statements/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setStatements((prev) => prev.filter((s) => s.id !== id))
        setConfirmDelete(null)
      }
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-5">
            <h1 className="text-lg font-semibold text-stone-800">Upload History</h1>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-stone-100" />)}
              </div>
            ) : statements.length === 0 ? (
              <div className="rounded-2xl bg-white border border-stone-100 p-10 text-center">
                <p className="text-3xl mb-3">📂</p>
                <p className="text-sm text-stone-500">No statements uploaded yet.</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-stone-100 divide-y divide-stone-100">
                {statements.map((s) => {
                  const status = STATUS_LABELS[s.status] ?? { label: s.status, colour: 'text-stone-500 bg-stone-50' }
                  const fmt = (d: string) => new Date(d).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
                  const period = s.period_start && s.period_end ? `${fmt(s.period_start)} – ${fmt(s.period_end)}` : s.month_year ?? '—'
                  // Strip bank prefix (first word) from stored bank_name to get just the card product name
                  const cardLabel = (txBankName: string | null, last4: string) => {
                    if (!txBankName) return `···${last4}`
                    const cardOnly = txBankName.trim().split(/\s+/).slice(1).join(' ').trim()
                    return cardOnly ? `${cardOnly} ···${last4}` : `···${last4}`
                  }
                  const multiCard = s.accounts && s.accounts.length > 1
                  return (
                    <div key={s.id} className="px-5 py-4">
                      {confirmDelete === s.id ? (
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm text-stone-700">Delete this statement and all its transactions?</p>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleDelete(s.id)}
                              disabled={deleting === s.id}
                              className="rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-rose-700 transition disabled:opacity-50"
                            >
                              {deleting === s.id ? 'Deleting…' : 'Delete'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-stone-800">
                              {s.bank_name ?? 'Unknown Bank'}
                            </p>
                            {multiCard ? (
                              <p className="text-xs text-stone-400 mt-0.5">
                                {s.accounts!.map((a) => cardLabel(a.bank_name, a.last4)).join('  ·  ')}
                              </p>
                            ) : s.account_last4 ? (
                              <p className="text-xs text-stone-400 mt-0.5">···{s.account_last4}</p>
                            ) : null}
                            <p className="text-xs text-stone-400 mt-0.5">{period}</p>
                            <p className="text-xs text-stone-400">{s.statement_type === 'credit_card' ? 'Credit card' : s.statement_type === 'bank_account' ? 'Bank account' : '—'}</p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.colour}`}>
                              {status.label}
                            </span>
                            <p className="text-xs text-stone-300">{fmt(s.uploaded_at)}</p>
                            <button
                              onClick={() => setConfirmDelete(s.id)}
                              className="text-xs text-stone-300 hover:text-rose-500 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
