'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
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
  | { stage: 'success' }
  | { stage: 'duplicate' }
  | { stage: 'error'; message: string }

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function BreakdownPage() {
  const [month, setMonth] = useState(getCurrentMonth)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [flow, setFlow] = useState<UploadFlow>({ stage: 'idle' })

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

  useEffect(() => {
    fetchTransactions(month)
  }, [month, fetchTransactions])

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

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar onUpload={openUpload} />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar onUpload={openUpload} />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-stone-800">Spending Breakdown</h1>
              <MonthSelector value={month} onChange={setMonth} />
            </div>

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
              <BreakdownTabs transactions={transactions} month={month} />
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
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-stone-800">
                {flow.stage === 'idle' && 'Upload a statement'}
                {flow.stage === 'processing' && 'Processing'}
                {flow.stage === 'needs_password' && 'Password required'}
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
            {flow.stage === 'success' && <SuccessState onDone={closeModal} />}
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
