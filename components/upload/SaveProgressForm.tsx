'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onDone: () => void
}

export function SaveProgressForm({ onDone }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: updateErr } = await supabase.auth.updateUser({ email, password })
      if (updateErr) {
        setError(updateErr.message)
        setSaving(false)
        return
      }

      const pending = sessionStorage.getItem('finclarity_pending_upload')
      if (pending) {
        const data = JSON.parse(pending)
        const res = await fetch('/api/statements/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const err = await res.json()
          setError(err.error ?? 'Failed to save data. Please try again.')
          setSaving(false)
          return
        }
        sessionStorage.removeItem('finclarity_pending_upload')
      }

      setSaved(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <div>
          <p className="text-lg font-semibold text-stone-800">Progress saved!</p>
          <p className="text-sm text-stone-500 mt-1">
            Check your email to confirm your account, then sign in any time to see your data.
          </p>
        </div>
        <button
          onClick={() => { window.location.href = '/dashboard' }}
          className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition"
        >
          Go to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm font-medium text-amber-800">Save your progress</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Create a free account to keep this data — otherwise it disappears when you close this tab.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-green-400 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-green-400 focus:outline-none"
        />

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save my progress'}
        </button>
      </form>

      <button
        onClick={onDone}
        className="text-xs text-stone-400 hover:text-stone-600 text-center transition"
      >
        Continue without saving — data will be lost when I close this tab
      </button>
    </div>
  )
}
