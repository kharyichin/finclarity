'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NarrativeSummary } from '@/components/dashboard/NarrativeSummary'
import { SpendSaveStrip } from '@/components/dashboard/SpendSaveStrip'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { NudgesSection } from '@/components/dashboard/NudgesSection'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Tooltip } from '@/components/ui/Tooltip'
import { UploadZone } from '@/components/upload/UploadZone'
import { PasswordPrompt } from '@/components/upload/PasswordPrompt'
import { SuccessState } from '@/components/upload/SuccessState'
import { ErrorState } from '@/components/upload/ErrorState'
import type { SummaryCards as SummaryCardsType, Nudge } from '@/types'

type UploadFlow =
  | { stage: 'idle' }
  | { stage: 'needs_password_anonymous'; file: File }
  | { stage: 'success' }
  | { stage: 'error'; message: string }

const DEMO_NARRATIVE =
  "You spent SGD 3,420 this month — food and transport made up most of it, which is pretty typical for April. You brought in SGD 5,200, so you're running about SGD 430 ahead after essentials. Groceries and Grab kept things grounded."

const DEMO_CARDS: SummaryCardsType = {
  spent: 3420.0,
  saved: 430.0,
  top_category: 'Food & Dining',
  watchout: 'Subscriptions crept up — 4 active services totalling SGD 62/month.',
}

const DEMO_NUDGES: Nudge[] = [
  {
    message: 'Your phone bill usually hits around the 20th — worth keeping SGD 85 aside.',
    pattern: 'recurring',
    predicted_date: '2026-05-20',
  },
  {
    message: "You've spent under SGD 100 on entertainment two months running. That's a pattern worth building on.",
    pattern: 'trend',
    predicted_date: null,
  },
]

export default function DemoPage() {
  const router = useRouter()
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

  const onAnonymousSuccess = useCallback(() => {
    setFlow({ stage: 'success' })
  }, [])

  const onNeedsPasswordAnonymous = useCallback((file: File) => {
    setFlow({ stage: 'needs_password_anonymous', file })
  }, [])

  // Authenticated user uploading from demo — just redirect to dashboard
  const onStatementCreated = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-5">

            {/* Demo ticker */}
            <div className="overflow-hidden rounded-xl bg-stone-100 py-2">
              <div
                className="flex whitespace-nowrap text-xs text-stone-400"
                style={{ animation: 'ticker 18s linear infinite' }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="px-8">
                    🌿 This is a sample — upload a statement to see your real picture.
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-stone-800">Your Month</h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-400">April 2026</span>
                <Link
                  href="/login"
                  className="text-sm text-stone-500 hover:text-stone-800 underline underline-offset-2 transition"
                >
                  Sign in
                </Link>
              </div>
            </div>

            {/* Narrative with tooltip */}
            <Tooltip step={1} message="This is your monthly summary — a plain-language snapshot of where your money went and how you're tracking.">
              <NarrativeSummary
                narrative={DEMO_NARRATIVE}
                hasUploads={true}
                onUpload={openUpload}
              />
            </Tooltip>

            <SpendSaveStrip data={DEMO_CARDS} />

            {/* Summary cards with tooltip */}
            <Tooltip step={2} message="Four cards that tell you the most important numbers at a glance — what you spent, what you saved, your biggest category, and one thing to watch.">
              <SummaryCards data={DEMO_CARDS} hasComparison={false} />
            </Tooltip>

            <NudgesSection nudges={DEMO_NUDGES} />

            {/* Upload CTA with tooltip */}
            <Tooltip step={3} message="When you're ready, upload a real bank statement — PDF from your bank app works perfectly. Your password is never stored.">
              <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-stone-50 p-6 text-center">
                <p className="text-2xl mb-2">🌿</p>
                <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                  This is a demo. Your real picture is one upload away.
                </p>
                <button
                  onClick={openUpload}
                  className="inline-block rounded-xl bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition"
                >
                  Upload my first statement
                </button>
              </div>
            </Tooltip>

          </div>
        </main>
      </div>

      {/* Upload modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-stone-800">
                {flow.stage === 'idle' && 'Upload a statement'}
                {flow.stage === 'needs_password_anonymous' && 'Password required'}
                {flow.stage === 'success' && 'Done!'}
                {flow.stage === 'error' && 'Something went wrong'}
              </h3>
              <button
                onClick={closeModal}
                className="text-stone-400 hover:text-stone-600 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {flow.stage === 'idle' && (
              <UploadZone
                onStatementCreated={onStatementCreated}
                onDuplicate={() => router.push('/dashboard')}
                onError={(msg) => setFlow({ stage: 'error', message: msg })}
                onAnonymousSuccess={onAnonymousSuccess}
                onNeedsPasswordAnonymous={onNeedsPasswordAnonymous}
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
              <SuccessState onDone={() => router.push('/dashboard')} isAnonymous={true} />
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
