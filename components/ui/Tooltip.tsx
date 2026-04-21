'use client'

import { useState } from 'react'

interface TooltipProps {
  children: React.ReactNode
  message: string
  step?: number
}

export function Tooltip({ children, message, step }: TooltipProps) {
  const [visible, setVisible] = useState(true)

  if (!visible) return <>{children}</>

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => setVisible(false)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 text-white text-sm text-left w-fit hover:bg-blue-600 transition shadow-sm"
      >
        {step !== undefined && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-blue-500 text-xs font-bold shrink-0">
            {step}
          </span>
        )}
        <span>{message}</span>
        <span className="text-blue-200 text-xs ml-1">✕</span>
      </button>
      <span className="text-blue-400 text-xs pl-3">↓</span>
      <div className="rounded-2xl ring-1 ring-blue-300 ring-offset-1">
        {children}
      </div>
    </div>
  )
}
