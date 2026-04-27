'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/breakdown', label: 'Spending Breakdown', icon: '📊' },
  { href: '/history', label: 'Upload History', icon: '📂' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export function Sidebar({ onUpload }: { onUpload?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Read session from local cache immediately (no network round-trip)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAnonymous(session?.user?.is_anonymous ?? true)
    })

    // React to sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAnonymous(session?.user?.is_anonymous ?? true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/demo')
  }

  return (
    <aside
      className={`flex flex-col h-full bg-white border-r border-stone-200 transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-52'
      }`}
    >
      <div className="flex items-center justify-end px-4 py-4 border-b border-stone-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-stone-400 hover:text-stone-600 transition text-lg leading-none"
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

      {/* Account section */}
      <div className="border-t border-stone-100 px-2 py-3 space-y-1">
        {isAnonymous ? (
          <>
            <Link
              href="/login"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition"
            >
              <span className="text-base shrink-0">🔑</span>
              {!collapsed && <span>Sign in</span>}
            </Link>
            <button
              onClick={onUpload}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition"
            >
              <span className="text-base shrink-0">✨</span>
              {!collapsed && <span>Create account</span>}
            </button>
          </>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition"
          >
            <span className="text-base shrink-0">↩︎</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        )}
      </div>
    </aside>
  )
}
