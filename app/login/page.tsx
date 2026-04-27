'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })

    if (signInErr) {
      setError("Couldn't sign in — check your email and password.")
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-2xl mb-1">🌿</p>
          <h1 className="text-xl font-semibold text-stone-800">Welcome back</h1>
          <p className="text-sm text-stone-400 mt-1">Sign in to see your financial picture.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4"
        >
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-green-400 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-green-400 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center">
            <span className="text-xs text-stone-400">Forgot password? Reset it from your email provider.</span>
          </p>
        </form>

        <p className="text-center text-xs text-stone-400 mt-5">
          No account yet?{' '}
          <Link href="/demo" className="text-green-700 hover:underline">
            Try the demo
          </Link>
        </p>
      </div>
    </div>
  )
}
