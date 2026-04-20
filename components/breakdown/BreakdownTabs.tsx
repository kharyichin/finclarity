'use client'

import { useState } from 'react'
import { CategoryView } from './CategoryView'
import { AccountView } from './AccountView'
import { TypeView } from './TypeView'
import { TimeView } from './TimeView'
import type { Transaction } from '@/types'

const tabs = [
  { id: 'category', label: 'By Category' },
  { id: 'account', label: 'By Account' },
  { id: 'type', label: 'By Type' },
  { id: 'time', label: 'By Time' },
]

export function BreakdownTabs({
  transactions,
  month,
}: {
  transactions: Transaction[]
  month: string
}) {
  const [active, setActive] = useState('category')

  return (
    <div>
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              active === tab.id
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'category' && <CategoryView transactions={transactions} />}
      {active === 'account' && <AccountView transactions={transactions} />}
      {active === 'type' && <TypeView transactions={transactions} />}
      {active === 'time' && <TimeView transactions={transactions} month={month} />}
    </div>
  )
}
