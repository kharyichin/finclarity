'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/breakdown', label: 'Spending Breakdown', icon: '◉' },
  { href: '/history', label: 'Upload History', icon: '◎' },
  { href: '/settings', label: 'Settings', icon: '◌' },
]

export function Sidebar({ onUpload }: { onUpload?: () => void }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`flex flex-col h-full bg-white border-r border-stone-200 transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-52'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
        {!collapsed && (
          <span className="font-semibold text-stone-800 text-sm">FinClarity</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-stone-400 hover:text-stone-600 transition text-lg leading-none ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              <span className="text-base shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 pb-4">
        <button
          onClick={onUpload}
          className={`w-full rounded-xl bg-green-600 text-white py-2.5 text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-2`}
        >
          <span>+</span>
          {!collapsed && <span>Upload Statement</span>}
        </button>
      </div>
    </aside>
  )
}