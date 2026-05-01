'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UploadZone } from '@/components/upload/UploadZone'
import { PasswordPrompt } from '@/components/upload/PasswordPrompt'
import { ProcessingState } from '@/components/upload/ProcessingState'
import { SuccessState } from '@/components/upload/SuccessState'
import { ErrorState } from '@/components/upload/ErrorState'
import { NarrativeSummary } from '@/components/dashboard/NarrativeSummary'
import { SpendSaveStrip } from '@/components/dashboard/SpendSaveStrip'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { ObservationsPanel } from '@/components/dashboard/ObservationsPanel'
import { NudgesSection } from '@/components/dashboard/NudgesSection'
import { InsightTiles } from '@/components/dashboard/InsightTiles'
import { BudgetBar } from '@/components/dashboard/BudgetBar'
import { SaveProgressForm } from '@/components/upload/SaveProgressForm'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { CheckInAnimation } from '@/components/retention/CheckInAnimation'
import type { MonthlyReport } from '@/types'

type UploadFlow =
  | { stage: 'idle' }
  | { stage: 'processing'; statementId: string; file: File }
  | { stage: 'needs_password'; statementId: string; file: File }
  | { stage: 'needs_password_anonymous'; file: File }
  | { stage: 'success' }
  | { stage: 'save_progress' }
  | { stage: 'duplicate' }
  | { stage: 'error'; message: string }

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getLastMonth() {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthHeading(month: string) {
  if (month === getCurrentMonth()) return 'This Month'
  if (month === getLastMonth()) return 'Last Month'
  return 'Selected Month'
}

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [flow, setFlow] = useState<UploadFlow>({ stage: 'idle' })
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [month, setMonth] = useState(getCurrentMonth)
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [creditCardOnly, setCreditCardOnly] = useState(false)
  const [hasUploads, setHasUploads] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number> | null>(null)
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null)

  // For anonymous users, only show the report when the selected month matches the upload's month
  const displayReport = isAnonymous
    ? (report?.month_year === month ? report : null)
    : report

  function loadAnonymousData() {
    const pending = sessionStorage.getItem('finclarity_pending_upload')
    if (pending) {
      try {
        const parsed = JSON.parse(pending)
        if (parsed.report) {
          setCreditCardOnly(parsed.creditCardOnly ?? false)
          setReport(parsed.report)
          setHasUploads(true)
          setLoading(false)
          return
        }
      } catch { /* ignore */ }
    }
    setReport(null)
    setLoading(false)
  }

  const fetchReport = useCallback(async (m: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports?month=${m}`)
      const data = await res.json()
      if (data.empty) {
        setReport(null)
        setCreditCardOnly(false)
      } else {
        setCreditCardOnly(data.creditCardOnly ?? false)
        setReport(data)
        setHasUploads(true)
      }
    } catch {
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auth check on mount — determines whether to use DB or sessionStorage
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const anon = data.user?.is_anonymous ?? false
      setIsAnonymous(anon)
      setAuthChecked(true)
      if (anon) {
        loadAnonymousData()
      } else {
        fetch('/api/user')
          .then((r) => (r.ok ? r.json() : null))
          .then((u) => {
            if (u) {
              setCategoryBudgets(u.category_budgets ?? {})
              setMonthlyBudget(u.monthly_budget ?? null)
            }
          })
          .catch(() => {})
      }
    })
  }, [])

  // Fetch from DB for authenticated users (also re-runs on month change)
  useEffect(() => {
    if (!authChecked || isAnonymous) return
    fetchReport(month)
  }, [month, fetchReport, authChecked, isAnonymous])

  const openUpload = () => {
    setFlow({ stage: 'idle' })
    setModalOpen(true)
  }

  const openAccountCreation = () => {
    setShowCheckIn(false)
    setFlow({ stage: 'save_progress' })
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
    setShowCheckIn(true)
    fetchReport(month)
  }, [month, fetchReport])

  const onAnonymousSuccess = useCallback(() => {
    setFlow({ stage: 'success' })
    setShowCheckIn(false)
    loadAnonymousData()
  }, [])

  const onNeedsPasswordAnonymous = useCallback((file: File) => {
    setFlow({ stage: 'needs_password_anonymous', file })
  }, [])

  const handleCreateAccount = useCallback(() => {
    const pending = sessionStorage.getItem('finclarity_pending_upload')
    if (pending) {
      openAccountCreation()
    } else {
      openUpload()
    }
  }, [])

  const hasMultipleMonths = false // will be updated in step 9 with check_ins

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar onUpload={openUpload} onCreateAccount={handleCreateAccount} />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar onUpload={openUpload} />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-5">

            {isAnonymous && hasUploads && (
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

            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-stone-800">{getMonthHeading(month)}</h1>
              <MonthSelector value={month} onChange={setMonth} />
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="rounded-2xl bg-stone-100 h-28" />
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl bg-stone-100 h-20" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <NarrativeSummary
                  narrative={displayReport?.narrative_text ?? null}
                  hasUploads={hasUploads}
                  onUpload={openUpload}
                  spent={displayReport?.summary_cards_json?.spent ?? null}
                  budgetTotal={
                    !isAnonymous
                      ? (() => {
                          const catSum = categoryBudgets
                            ? Object.values(categoryBudgets).filter((v) => v > 0).reduce((s, v) => s + v, 0)
                            : 0
                          return catSum > 0 ? catSum : (monthlyBudget ?? null)
                        })()
                      : null
                  }
                />

                <SpendSaveStrip
                  data={displayReport?.summary_cards_json ?? null}
                  budget={!isAnonymous ? (() => {
                    const catSum = categoryBudgets
                      ? Object.values(categoryBudgets).filter((v) => v > 0).reduce((s, v) => s + v, 0)
                      : 0
                    return catSum > 0 ? catSum : (monthlyBudget ?? null)
                  })() : null}
                />

                <SummaryCards
                  data={displayReport?.summary_cards_json ?? null}
                  hasComparison={hasMultipleMonths}
                  creditCardOnly={creditCardOnly}
                />

                {!isAnonymous && (
                  <BudgetBar
                    spent={displayReport?.summary_cards_json?.spent ?? null}
                    monthlyBudget={monthlyBudget}
                    categoryBudgets={categoryBudgets}
                    month={month}
                  />
                )}

                <InsightTiles month={month} isAnonymous={isAnonymous} />

                <ObservationsPanel
                  observations={displayReport?.observations_json ?? null}
                  hasMultipleMonths={hasMultipleMonths}
                />

                <NudgesSection nudges={displayReport?.nudges_json ?? null} />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Upload modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => {
              if (flow.stage !== 'processing') closeModal()
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-stone-800">
                {flow.stage === 'idle' && 'Upload a statement'}
                {flow.stage === 'processing' && 'Processing'}
                {(flow.stage === 'needs_password' || flow.stage === 'needs_password_anonymous') && 'Password required'}
                {flow.stage === 'success' && 'Done!'}
                {flow.stage === 'save_progress' && 'Save your progress'}
                {flow.stage === 'duplicate' && 'Already uploaded'}
                {flow.stage === 'error' && 'Something went wrong'}
              </h3>
              {flow.stage !== 'processing' && (
                <button
                  onClick={closeModal}
                  className="text-stone-400 hover:text-stone-600 text-xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              )}
            </div>

            {flow.stage === 'idle' && (
              <UploadZone
                onStatementCreated={onStatementCreated}
                onDuplicate={() => setFlow({ stage: 'duplicate' })}
                onError={(msg) => setFlow({ stage: 'error', message: msg })}
                onAnonymousSuccess={onAnonymousSuccess}
                onNeedsPasswordAnonymous={onNeedsPasswordAnonymous}
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

            {flow.stage === 'success' && (
              showCheckIn
                ? <CheckInAnimation onDone={() => { setShowCheckIn(false); closeModal() }} />
                : <SuccessState onDone={closeModal} isAnonymous={isAnonymous} />
            )}

            {flow.stage === 'save_progress' && (
              <SaveProgressForm onDone={closeModal} />
            )}

            {flow.stage === 'duplicate' && (
              <div className="text-center py-4">
                <p className="text-3xl mb-3">📋</p>
                <p className="text-sm font-medium text-stone-700">
                  This statement is already in your account.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-4 rounded-xl bg-stone-100 px-5 py-2 text-sm text-stone-600 hover:bg-stone-200 transition"
                >
                  Got it
                </button>
              </div>
            )}

            {flow.stage === 'error' && (
              <ErrorState
                message={flow.message}
                onRetry={() => setFlow({ stage: 'idle' })}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
