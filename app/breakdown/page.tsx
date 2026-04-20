'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { BreakdownTabs } from '@/components/breakdown/BreakdownTabs'
import type { Transaction } from '@/types'

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function BreakdownPage() {
  const [month, setMonth] = useState(getCurrentMonth)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async (m: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/transactions?month=${m}`)
      const data = await res.json()
      setTransactions(Array.isArray(data) ? data : [])
    } catch {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions(month)
  }, [month, fetchTransactions])

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-stone-800">Spending Breakdown</h1>
              <MonthSelector value={month} onChange={setMonth} />
            </div>

            <p className="text-xs text-stone-400">
              Conversions are estimates. Your bank may have applied a different rate.
              Where your statement states the exact SGD amount charged, that figure is used instead.
            </p>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="rounded-xl bg-stone-100 h-10" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl bg-stone-100 h-24" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-2xl bg-white border border-stone-100 p-10 text-center">
                <p className="text-3xl mb-3">📂</p>
                <p className="text-sm font-medium text-stone-600">No transactions for this month.</p>
                <p className="text-xs text-stone-400 mt-1">Upload a bank statement to see your breakdown here.</p>
              </div>
            ) : (
              <BreakdownTabs transactions={transactions} month={month} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
