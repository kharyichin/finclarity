'use client'

import { StreakCounter } from '@/components/retention/StreakCounter'

interface TopBarProps {
  onUpload?: () => void
}

export function TopBar({ onUpload }: TopBarProps) {
  return (
    <header className="h-14 border-b border-stone-200 bg-white flex items-center justify-between px-6 gap-4">
      <span className="font-semibold text-stone-800 text-sm">FinClarity</span>
      <div className="flex items-center gap-4">
        <StreakCounter />
        {onUpload && (
          <button
            onClick={onUpload}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
          >
            + Upload statement
          </button>
        )}
      </div>
    </header>
  )
}