'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import type { Statement } from '@/types'

const STATUS_LABELS: Record<string, { label: string; colour: string }> = {
  complete: { label: 'Complete', colour: 'text-green-600 bg-green-50' },
  processing: { label: 'Processing', colour: 'text-amber-600 bg-amber-50' },
  needs_password: { label: 'Needs password', colour: 'text-amber-600 bg-amber-50' },
  failed: { label: 'Failed', colour: 'text-rose-600 bg-rose-50' },
}

export default function HistoryPage() {
  const [statements, setStatements] = useState<Statement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/statements')
        if (res.ok) setStatements(await res.json())
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    load()
  }, [])

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
                  return (
                    <div key={s.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-stone-800">
                          {s.bank_name ?? 'Unknown Bank'}{s.account_last4 ? ` ···${s.account_last4}` : ''}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">{period}</p>
                        <p className="text-xs text-stone-400">{s.statement_type === 'credit_card' ? 'Credit card' : s.statement_type === 'bank_account' ? 'Bank account' : '—'}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.colour}`}>
                          {status.label}
                        </span>
                        <p className="text-xs text-stone-300 mt-1">{fmt(s.uploaded_at)}</p>
                      </div>
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
