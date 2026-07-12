'use client'

import { useState, useRef, useEffect } from 'react'

interface MonthSelectorProps {
  value: string // 'YYYY-MM'
  onChange: (month: string) => void
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonthLabel(monthYear: string) {
  const [year, month] = monthYear.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })
}

function addMonths(monthYear: string, delta: number) {
  const [year, month] = monthYear.split('-').map(Number)
  const d = new Date(year, month - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear()
  return [currentYear, currentYear - 1, currentYear - 2]
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = getCurrentMonth()
  const [year, month] = value.split('-').map(Number)

  const prev = addMonths(value, -1)
  const next = addMonths(value, 1)
  const canGoNext = next <= current

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const years = getAvailableYears()

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(prev)}
          className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 transition flex items-center justify-center text-stone-600 text-sm"
          aria-label="Previous month"
        >
          ‹
        </button>

        <button
          onClick={() => setOpen((o) => !o)}
          className="font-medium text-stone-800 min-w-[140px] text-center hover:text-green-700 transition text-sm"
          aria-label="Pick a month"
        >
          {formatMonthLabel(value)}
          <span className="ml-1 text-xs text-stone-400">{open ? '▲' : '▼'}</span>
        </button>

        <button
          onClick={() => canGoNext && onChange(next)}
          disabled={!canGoNext}
          className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 transition flex items-center justify-center text-stone-600 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-10 z-50 bg-white rounded-2xl shadow-lg border border-stone-100 p-4 w-72 max-w-[calc(100vw-2rem)]">
          {years.map((y) => (
            <div key={y} className="mb-3 last:mb-0">
              <p className="text-xs font-semibold text-stone-400 mb-2">{y}</p>
              <div className="grid grid-cols-4 gap-1">
                {MONTH_NAMES.map((name, idx) => {
                  const m = `${y}-${String(idx + 1).padStart(2, '0')}`
                  const isSelected = m === value
                  const isFuture = m > current
                  return (
                    <button
                      key={m}
                      disabled={isFuture}
                      onClick={() => { onChange(m); setOpen(false) }}
                      className={`rounded-xl py-1.5 text-xs font-medium transition ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : isFuture
                          ? 'text-stone-300 cursor-not-allowed'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
