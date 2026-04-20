'use client'

interface TopBarProps {
  streak?: number
  onUpload?: () => void
}

export function TopBar({ streak, onUpload }: TopBarProps) {
  return (
    <header className="h-14 border-b border-stone-200 bg-white flex items-center justify-between px-6 gap-4">
      <div />
      <div className="flex items-center gap-4">
        {streak !== undefined && streak > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-stone-600">
            <span>🌱</span>
            <span>{streak} month{streak !== 1 ? 's' : ''} in a row</span>
          </div>
        )}
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