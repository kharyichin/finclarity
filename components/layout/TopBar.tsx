'use client'

import { StreakCounter } from '@/components/retention/StreakCounter'

interface TopBarProps {
  onUpload?: () => void
}

export function TopBar({ onUpload }: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-stone-200 bg-white px-6">
      <span className="text-sm font-semibold tracking-tight text-stone-900">FinClarity</span>
      <div className="flex items-center gap-3">
        <StreakCounter />
        {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="rounded-xl bg-stone-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Upload statement
          </button>
        )}
      </div>
    </header>
  )
}
