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
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-left shadow-sm shadow-stone-200/50">
        {step !== undefined && (
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-800 text-[10px] font-semibold text-white">
            {step}
          </span>
        )}
        <p className="flex-1 text-sm leading-relaxed text-stone-600">{message}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-stone-400 transition hover:bg-stone-200/70 hover:text-stone-700"
          aria-label="Dismiss tip"
        >
          Got it
        </button>
      </div>
      <div>{children}</div>
    </div>
  )
}
