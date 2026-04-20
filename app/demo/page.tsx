'use client'

import Link from 'next/link'
import { NarrativeSummary } from '@/components/dashboard/NarrativeSummary'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { NudgesSection } from '@/components/dashboard/NudgesSection'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Tooltip } from '@/components/ui/Tooltip'
import type { SummaryCards as SummaryCardsType, Nudge } from '@/types'

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
  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-5">

            {/* Demo banner */}
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
              <span className="text-amber-500 text-sm">◆</span>
              <p className="text-xs font-medium text-amber-700">
                Demo — not your real finances. Upload a statement to see your actual picture.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-stone-800">Your Month</h1>
              <span className="text-sm text-stone-400">April 2026</span>
            </div>

            {/* Narrative with tooltip */}
            <Tooltip message="This is your monthly summary — a plain-language snapshot of where your money went and how you're tracking.">
              <NarrativeSummary
                narrative={DEMO_NARRATIVE}
                hasUploads={true}
                onUpload={() => {}}
              />
            </Tooltip>

            {/* Summary cards with tooltip */}
            <Tooltip message="Four cards that tell you the most important numbers at a glance — what you spent, what you saved, your biggest category, and one thing to watch.">
              <SummaryCards data={DEMO_CARDS} hasComparison={false} />
            </Tooltip>

            <NudgesSection nudges={DEMO_NUDGES} />

            {/* Upload CTA with tooltip */}
            <Tooltip message="When you're ready, upload a real bank statement — PDF from your bank app works perfectly. Your password is never stored.">
              <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-stone-50 p-6 text-center">
                <p className="text-2xl mb-2">🌿</p>
                <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                  This is a demo. Your real picture is one upload away.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block rounded-xl bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition"
                >
                  Upload my first statement
                </Link>
              </div>
            </Tooltip>

          </div>
        </main>
      </div>
    </div>
  )
}
