'use client'

import { useState, useCallback } from 'react'
import { UploadZone } from '@/components/upload/UploadZone'
import { PasswordPrompt } from '@/components/upload/PasswordPrompt'
import { ProcessingState } from '@/components/upload/ProcessingState'
import { SuccessState } from '@/components/upload/SuccessState'
import { ErrorState } from '@/components/upload/ErrorState'

type UploadFlow =
  | { stage: 'idle' }
  | { stage: 'processing'; statementId: string; file: File }
  | { stage: 'needs_password'; statementId: string; file: File }
  | { stage: 'success' }
  | { stage: 'duplicate' }
  | { stage: 'error'; message: string }

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [flow, setFlow] = useState<UploadFlow>({ stage: 'idle' })

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

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-800">FinClarity</h1>
        <button
          onClick={openUpload}
          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
        >
          + Upload statement
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
          <p className="text-4xl mb-3">🌿</p>
          <h2 className="text-xl font-semibold text-stone-800">Welcome to FinClarity</h2>
          <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">
            Upload your first bank statement to see a clear picture of where your money goes.
          </p>
          <button
            onClick={openUpload}
            className="mt-6 rounded-xl bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 transition"
          >
            Upload your first statement
          </button>
        </div>
      </main>

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
                onSuccess={() => setFlow({ stage: 'success' })}
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
