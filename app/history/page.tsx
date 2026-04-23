'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { UploadZone } from '@/components/upload/UploadZone'
import { PasswordPrompt } from '@/components/upload/PasswordPrompt'
import { ProcessingState } from '@/components/upload/ProcessingState'
import { SuccessState } from '@/components/upload/SuccessState'
import { ErrorState } from '@/components/upload/ErrorState'
import type { Statement } from '@/types'

interface StatementWithAccounts extends Statement {
  accounts?: Array<{ last4: string; bank_name: string | null }>
}

type UploadFlow =
  | { stage: 'idle' }
  | { stage: 'processing'; statementId: string; file: File }
  | { stage: 'needs_password'; statementId: string; file: File }
  | { stage: 'success' }
  | { stage: 'duplicate' }
  | { stage: 'error'; message: string }

const STATUS_LABELS: Record<string, { label: string; colour: string }> = {
  complete: { label: 'Complete', colour: 'text-green-600 bg-green-50' },
  processing: { label: 'Processing', colour: 'text-amber-600 bg-amber-50' },
  needs_password: { label: 'Needs password', colour: 'text-amber-600 bg-amber-50' },
  failed: { label: 'Failed', colour: 'text-rose-600 bg-rose-50' },
}

export default function HistoryPage() {
  const [statements, setStatements] = useState<StatementWithAccounts[]>([])
  const [loading, setLoading] = useState(true)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [flow, setFlow] = useState<UploadFlow>({ stage: 'idle' })

  const loadStatements = useCallback(async () => {
    try {
      const res = await fetch('/api/statements')
      if (res.ok) setStatements(await res.json())
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadStatements() }, [loadStatements])

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
    loadStatements()
  }, [loadStatements])

  function toggleSelectMode() {
    setSelectMode((v) => !v)
    setSelected(new Set())
    setConfirmDelete(false)
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === statements.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(statements.map((s) => s.id)))
    }
  }

  async function handleDeleteSelected() {
    setDeleting(true)
    try {
      await Promise.all(
        [...selected].map((id) => fetch(`/api/statements/${id}`, { method: 'DELETE' }))
      )
      setStatements((prev) => prev.filter((s) => !selected.has(s.id)))
      setSelected(new Set())
      setSelectMode(false)
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar onUpload={openUpload} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar onUpload={openUpload} />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-5">

            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-stone-800">Upload History</h1>
              {!loading && statements.length > 0 && (
                <button
                  onClick={toggleSelectMode}
                  className="text-sm text-stone-400 hover:text-stone-600 transition"
                >
                  {selectMode ? 'Cancel' : 'Select'}
                </button>
              )}
            </div>

            {selectMode && (
              <div className="flex items-center justify-between rounded-2xl bg-white border border-stone-100 px-5 py-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.size === statements.length && statements.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-green-600"
                  />
                  <span className="text-sm text-stone-500">
                    {selected.size === 0 ? 'Select all' : `${selected.size} selected`}
                  </span>
                </div>

                {confirmDelete ? (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-stone-600">
                      Delete {selected.size} statement{selected.size !== 1 ? 's' : ''} and all their transactions?
                    </p>
                    <button
                      onClick={handleDeleteSelected}
                      disabled={deleting}
                      className="rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-rose-700 transition disabled:opacity-50"
                    >
                      {deleting ? 'Deleting…' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-stone-400 hover:text-stone-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={selected.size === 0}
                    className="rounded-lg bg-rose-50 text-rose-500 px-3 py-1.5 text-xs font-medium hover:bg-rose-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Delete selected
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-stone-100" />)}
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
                  const cardLabel = (txBankName: string | null, last4: string) => {
                    if (!txBankName) return `···${last4}`
                    const cardOnly = txBankName.trim().split(/\s+/).slice(1).join(' ').trim()
                    return cardOnly ? `${cardOnly} ···${last4}` : `···${last4}`
                  }
                  const multiCard = s.accounts && s.accounts.length > 1
                  const isSelected = selected.has(s.id)

                  return (
                    <div
                      key={s.id}
                      onClick={selectMode ? () => toggleSelect(s.id) : undefined}
                      className={`px-5 py-4 flex items-center gap-4 transition ${selectMode ? 'cursor-pointer' : ''} ${isSelected ? 'bg-green-50' : ''}`}
                    >
                      {selectMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(s.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded accent-green-600 shrink-0"
                        />
                      )}

                      <div className="flex flex-1 items-center justify-between">
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
                          <p className="text-xs text-stone-400">
                            {s.statement_type === 'credit_card' ? 'Credit card' : s.statement_type === 'bank_account' ? 'Bank account' : '—'}
                          </p>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.colour}`}>
                            {status.label}
                          </span>
                          <p className="text-xs text-stone-300">{fmt(s.uploaded_at)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Upload modal */}
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
