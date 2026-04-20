'use client'

import { useState } from 'react'

interface TooltipProps {
  children: React.ReactNode
  message: string
}

export function Tooltip({ children, message }: TooltipProps) {
  const [visible, setVisible] = useState(true)

  return (
    <div className="relative">
      {children}
      {visible && (
        <div
          className="absolute inset-0 z-10 flex items-end justify-start p-3 rounded-2xl cursor-pointer"
          onClick={() => setVisible(false)}
        >
          <div className="rounded-xl bg-stone-900/90 text-white text-xs px-3 py-2 max-w-xs text-left leading-relaxed shadow-lg">
            <p>{message}</p>
            <p className="mt-1 text-stone-400 text-[10px]">Tap anywhere to dismiss</p>
          </div>
        </div>
      )}
    </div>
  )
}
