'use client'

interface TopBarProps {
  streak?: number
}

export function TopBar({ streak }: TopBarProps) {
  return (
    <header className="h-14 border-b border-stone-200 bg-white flex items-center justify-end px-6 gap-4">
      {streak !== undefined && streak > 0 && (
        <div className="flex items-center gap-1.5 text-sm text-stone-600">
          <span className="text-green-600">🌱</span>
          <span>{streak} month{streak !== 1 ? 's' : ''} in a row</span>
        </div>
      )}
    </header>
  )
}