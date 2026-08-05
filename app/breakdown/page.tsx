'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { FxDisclaimer } from '@/components/ui/FxDisclaimer'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { BreakdownTabs } from '@/components/breakdown/BreakdownTabs'
import { UploadZone } from '@/components/upload/UploadZone'
import { PasswordPrompt } from '@/components/upload/PasswordPrompt'
import { ProcessingState } from '@/components/upload/ProcessingState'
import { SuccessState } from '@/components/upload/SuccessState'
import { ErrorState } from '@/components/upload/ErrorState'
import type { Transaction } from '@/types'

type UploadFlow =
  | { stage: 'idle' }
  | { stage: 'processing'; statementId: string; file: File }
  | { stage: 'needs_password'; statementId: string; file: File }
  | { stage: 'needs_password_anonymous'; file: File }
  | { stage: 'success' }
  | { stage: 'duplicate' }
  | { stage: 'error'; message: string }

function getLastMonth() {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function BreakdownPage() {
  const [month, setMonth] = useState(getLastMonth)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [flow, setFlow] = useState<UploadFlow>({ stage: 'idle' })
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const anon = data.user?.is_anonymous ?? false
      setIsAnonymous(anon)
      if (anon) {
        // Anonymous data only ever holds one month (the uploaded statement's) —
        // point the selector at it instead of leaving it on the calendar default.
        const pending = sessionStorage.getItem('finclarity_pending_upload')
        if (pending) {
          try {
            const parsed = JSON.parse(pending)
            if (parsed.meta?.monthYear) setMonth(parsed.meta.monthYear)
          } catch { /* ignore */ }
        }
      } else {
        fetch('/api/user')
          .then((r) => (r.ok ? r.json() : null))
          .then((u) => { if (u?.category_budgets) setCategoryBudgets(u.category_budgets) })
          .catch(() => {})
      }
      setAuthChecked(true)
    })
  }, [])

  const fetchTransactions = useCallback(async (m: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/transactions?month=${m}`)
      const data = await res.json()
      setTransactions(Array.isArray(data) ? data : [])
    } catch {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAnonTransactions = useCallback((selectedMonth: string) => {
    setLoading(true)
    const pending = sessionStorage.getItem('finclarity_pending_upload')
    if (!pending) { setTransactions([]); setLoading(false); return }
    try {
      const parsed = JSON.parse(pending)
      if (!parsed.rawTransactions || !parsed.meta || parsed.meta.monthYear !== selectedMonth) {
        setTransactions([])
        setLoading(false)
        return
      }
      const meta = parsed.meta
      const bankDisplay = meta.cardName ? `${meta.bankName} ${meta.cardName}` : meta.bankName
      const mapped: Transaction[] = parsed.rawTransactions.map((tx: Record<string, unknown>, idx: number) => ({
        id: `anon-${idx}`,
        user_id: 'anonymous',
        statement_id: 'anonymous',
        date: tx.date as string,
        merchant: tx.merchant as string,
        amount: tx.amount as number,
        currency: (tx.currency as string) || 'SGD',
        sgd_amount: (tx.bankRateSGD as number) ?? (tx.amount as number),
        original_amount: (tx.originalAmount as number) ?? (tx.amount as number),
        bank_rate: (tx.bankRate as number) ?? null,
        bank_rate_sgd: (tx.bankRateSGD as number) ?? null,
        estimated_rate_sgd: null,
        exchange_rate_source: tx.bankRate ? 'bank' : null,
        claude_category: (tx.category as string) ?? null,
        user_category: null,
        type: tx.type as Transaction['type'],
        transfer_pair_id: (tx.transferPairId as string) ?? null,
        account_last4: (tx.accountLast4 as string) || meta.accountLast4,
        bank_name: bankDisplay,
        month_year: meta.monthYear,
      }))
      setTransactions(mapped)
    } catch {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authChecked) return
    if (isAnonymous) {
      loadAnonTransactions(month)
    } else {
      fetchTransactions(month)
    }
  }, [month, fetchTransactions, loadAnonTransactions, isAnonymous, authChecked])

  const openUpload = () => {
    setFlow({ stage: 'idle' })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setFlow({ stage: 'idle' })
  }

  const onStatementCreated = useCallback((statementId: string, file: File) => {
    setFlow({ stage: 'processing', statementId, file })
  }, [])

  const onNeedsPassword = useCallback(() => {
    setFlow((prev) => {
      if (prev.stage === 'processing') {
        return { stage: 'needs_password', statementId: prev.statementId, file: prev.file }
      }
      return { stage: 'error', message: 'Could not prompt for password. Please try uploading again.' }
    })
  }, [])

  const onSuccess = useCallback(() => {
    setFlow({ stage: 'success' })
    fetchTransactions(month)
  }, [month, fetchTransactions])

  const openAccountCreation = () => {
    setFlow({ stage: 'success' })
    setModalOpen(true)
  }

  const onAnonymousSuccess = useCallback(() => {
    setFlow({ stage: 'success' })
    const pending = sessionStorage.getItem('finclarity_pending_upload')
    let newMonth = month
    if (pending) {
      try {
        const parsed = JSON.parse(pending)
        if (parsed.meta?.monthYear) newMonth = parsed.meta.monthYear
      } catch { /* ignore */ }
    }
    setMonth(newMonth)
    loadAnonTransactions(newMonth)
  }, [month, loadAnonTransactions])

  const onNeedsPasswordAnonymous = useCallback((file: File) => {
    setFlow({ stage: 'needs_password_anonymous', file })
  }, [])

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar onUpload={openUpload} />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar onUpload={openUpload} />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-5">
            <FxDisclaimer />

            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-stone-800">Spending Breakdown</h1>
              <MonthSelector value={month} onChange={setMonth} />
            </div>

            {isAnonymous && transactions.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This data is only saved in this browser tab.{' '}
                <button
                  onClick={openAccountCreation}
                  className="font-medium underline underline-offset-2 hover:text-amber-900"
                >
                  Create an account to keep it.
                </button>
              </div>
            )}

            <p className="text-xs text-stone-400">
              Conversions are estimates. Your bank may have applied a different rate.
              Where your statement states the exact SGD amount charged, that figure is used instead.
            </p>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="rounded-xl bg-stone-100 h-10" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl bg-stone-100 h-24" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-2xl bg-white border border-stone-100 p-10 text-center">
                <p className="text-3xl mb-3">📂</p>
                <p className="text-sm font-medium text-stone-600">No transactions for this month.</p>
                <p className="text-xs text-stone-400 mt-1 mb-5">Upload a bank statement to see your breakdown here.</p>
                <button
                  onClick={openUpload}
                  className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition"
                >
                  + Upload statement
                </button>
              </div>
            ) : (
              <BreakdownTabs transactions={transactions} month={month} categoryBudgets={categoryBudgets} />
            )}
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => { if (flow.stage !== 'processing') closeModal() }}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-stone-800">
                {flow.stage === 'idle' && 'Upload a statement'}
                {flow.stage === 'processing' && 'Processing'}
                {(flow.stage === 'needs_password' || flow.stage === 'needs_password_anonymous') && 'Password required'}
                {flow.stage === 'success' && 'Done!'}
                {flow.stage === 'duplicate' && 'Already uploaded'}
                {flow.stage === 'error' && 'Something went wrong'}
              </h3>
              {flow.stage !== 'processing' && (
                <button onClick={closeModal} className="text-stone-400 hover:text-stone-600 text-xl leading-none" aria-label="Close">×</button>
              )}
            </div>

            {flow.stage === 'idle' && (
              <UploadZone
                onStatementCreated={onStatementCreated}
                onDuplicate={() => setFlow({ stage: 'duplicate' })}
                onError={(msg) => setFlow({ stage: 'error', message: msg })}
                onAnonymousSuccess={onAnonymousSuccess}
                onNeedsPasswordAnonymous={onNeedsPasswordAnonymous}
                onAllDone={onSuccess}
              />
            )}
            {flow.stage === 'processing' && (
              <ProcessingState
                statementId={flow.statementId}
                onNeedsPassword={onNeedsPassword}
                onSuccess={onSuccess}
                onError={(msg) => setFlow({ stage: 'error', message: msg })}
              />
            )}
            {flow.stage === 'needs_password' && (
              <PasswordPrompt
                statementId={flow.statementId}
                file={flow.file}
                onStatementReady={(id) =>
                  setFlow((prev) =>
                    prev.stage === 'needs_password'
                      ? { stage: 'processing', statementId: id, file: prev.file }
                      : prev
                  )
                }
                onError={(msg) => setFlow({ stage: 'error', message: msg })}
              />
            )}
            {flow.stage === 'needs_password_anonymous' && (
              <PasswordPrompt
                file={flow.file}
                onAnonymousSuccess={onAnonymousSuccess}
                onError={(msg) => setFlow({ stage: 'error', message: msg })}
              />
            )}
            {flow.stage === 'success' && <SuccessState onDone={closeModal} isAnonymous={isAnonymous} />}
            {flow.stage === 'duplicate' && (
              <div className="text-center py-4">
                <p className="text-3xl mb-3">📋</p>
                <p className="text-sm font-medium text-stone-700">This statement is already in your account.</p>
                <button onClick={closeModal} className="mt-4 rounded-xl bg-stone-100 px-5 py-2 text-sm text-stone-600 hover:bg-stone-200 transition">Got it</button>
              </div>
            )}
            {flow.stage === 'error' && (
              <ErrorState message={flow.message} onRetry={() => setFlow({ stage: 'idle' })} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
