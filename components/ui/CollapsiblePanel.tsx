'use client'

import { useState } from 'react'

interface CollapsiblePanelProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function CollapsiblePanel({ title, children, defaultOpen = false }: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-stone-50 transition"
      >
        <span className="font-medium text-stone-800">{title}</span>
        <span className="text-stone-400 text-lg leading-none">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  )
}
