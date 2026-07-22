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

  const onStatementCreated = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onUpload={openUpload} />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-2xl space-y-5">
            {/* Quiet sample banner */}
            <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-stone-800">Sample month</p>
                <p className="mt-0.5 text-sm text-stone-500">
                  Explore the product with demo data. Upload when you want your real picture.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href="/"
                  className="text-sm text-stone-500 underline-offset-2 transition hover:text-stone-800 hover:underline"
                >
                  About
                </Link>
                <button
                  type="button"
                  onClick={openUpload}
                  className="rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
                >
                  Upload statement
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-stone-800">Your Month</h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-400">April 2026</span>
                <Link
                  href="/login"
                  className="text-sm text-stone-500 underline underline-offset-2 transition hover:text-stone-800"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <Tooltip
              step={1}
              message="Your monthly summary — a plain-language snapshot of where money went."
            >
              <NarrativeSummary
                narrative={DEMO_NARRATIVE}
                hasUploads={true}
                onUpload={openUpload}
              />
            </Tooltip>

            <SpendSaveStrip data={DEMO_CARDS} />

            <Tooltip
              step={2}
              message="Key numbers at a glance: spent, saved, top category, and one thing to watch."
            >
              <SummaryCards data={DEMO_CARDS} hasComparison={false} />
            </Tooltip>

            <NudgesSection nudges={DEMO_NUDGES} />

            <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm shadow-stone-200/40">
              <p className="text-sm font-medium text-stone-800">Ready for your numbers?</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
                Upload a bank PDF. If it is password-protected, you enter the password once — it is never stored.
              </p>
              <button
                type="button"
                onClick={openUpload}
                className="mt-5 inline-block rounded-xl bg-green-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-800"
              >
                Upload my first statement
              </button>
            </div>
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">
                {flow.stage === 'idle' && 'Upload a statement'}
                {flow.stage === 'needs_password_anonymous' && 'Password required'}
                {flow.stage === 'success' && 'Done!'}
                {flow.stage === 'error' && 'Something went wrong'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-xl leading-none text-stone-400 hover:text-stone-600"
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
