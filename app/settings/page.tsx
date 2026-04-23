'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { createClient } from '@/lib/supabase/client'

const APP_VERSION = '1.0.0'

function ExportSection({ isSignedIn }: { isSignedIn: boolean }) {
  const now = new Date()
  // Build last 12 months as options
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })
    return { value, label }
  })
  const [selectedMonth, setSelectedMonth] = useState(months[0].value)

  return (
    <section className="rounded-2xl bg-white border border-stone-100 divide-y divide-stone-100">
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Export</p>
        <p className="text-xs text-stone-400 mb-3">
          Opens a printable monthly summary with spending charts. Use your browser&apos;s &ldquo;Save as PDF&rdquo; option.
        </p>
        {isSignedIn ? (
          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 text-stone-700 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              {months.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <a
              href={`/report?month=${selectedMonth}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
            >
              ↓ Download PDF
            </a>
          </div>
        ) : (
          <p className="text-xs text-amber-600 font-medium">
            Create an account above to unlock PDF exports.
          </p>
        )}
      </div>
    </section>
  )
}

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

interface UserProfile {
  email: string | null
  auth_email: string | null
  check_in_day: number | null
  theme: 'light' | 'dark'
  age_bracket: string | null
  gender: string | null
  analytics_consent: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  // Account creation
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupDone, setSignupDone] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/user')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        applyTheme(data.theme ?? 'light')
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { load() }, [load])

  async function save(patch: Partial<UserProfile>) {
    setSaving(true)
    try {
      await fetch('/api/user', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
      setProfile((p) => p ? { ...p, ...patch } : p)
      if (patch.theme) applyTheme(patch.theme)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setSignupLoading(true)
    setSignupError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        email: signupEmail,
        password: signupPassword,
      })
      if (error) throw error
      setSignupDone(true)
    } catch (err: unknown) {
      setSignupError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSignupLoading(false)
    }
  }

  async function deleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch('/api/user', { method: 'DELETE' })
      if (res.ok) router.push('/demo')
    } finally { setDeleting(false) }
  }

  if (!profile) return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-green-300 border-t-green-600 animate-spin" />
        </main>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-stone-800">Settings</h1>
              {saved && <span className="text-xs text-green-600 font-medium">Saved ✓</span>}
            </div>

            {/* Account */}
            <section className="rounded-2xl bg-white border border-stone-100 divide-y divide-stone-100">
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Account</p>
                {profile.auth_email ? (
                  <p className="text-sm text-stone-700">{profile.auth_email}</p>
                ) : signupDone ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-700">Check your email</p>
                    <p className="text-xs text-stone-400">We sent a confirmation link to <strong>{signupEmail}</strong>. Click it to activate your account.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-stone-400">You're on an anonymous account. Create an account to keep your data if you clear your browser.</p>
                    <form onSubmit={handleSignup} className="space-y-2">
                      <input
                        type="email"
                        required
                        placeholder="Email address"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Password (min 6 characters)"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      {signupError && <p className="text-xs text-rose-500">{signupError}</p>}
                      <button
                        type="submit"
                        disabled={signupLoading}
                        className="w-full rounded-xl bg-green-600 text-white py-2 text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {signupLoading ? 'Creating account…' : 'Create account'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </section>

            {/* Notifications */}
            <section className="rounded-2xl bg-white border border-stone-100 divide-y divide-stone-100">
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Monthly Reminder</p>
                {profile.auth_email ? (
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-stone-700">Check-in day</span>
                    <select
                      value={profile.check_in_day ?? ''}
                      onChange={(e) => save({ check_in_day: e.target.value ? Number(e.target.value) : null })}
                      disabled={saving}
                      className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 text-stone-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">No reminder</option>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'} of each month</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="text-xs text-amber-600 font-medium">Create an account above to receive monthly reminders.</p>
                )}
              </div>
            </section>

            {/* Theme */}
            <section className="rounded-2xl bg-white border border-stone-100">
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Appearance</p>
                <div className="flex gap-3">
                  {(['light', 'dark'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => save({ theme: t })}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-medium border transition ${
                        profile.theme === t
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Optional profile */}
            <section className="rounded-2xl bg-white border border-stone-100 divide-y divide-stone-100">
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Profile <span className="normal-case font-normal text-stone-400">— optional</span></p>
                <p className="text-xs text-stone-400 mb-3">Used for anonymised benchmarking in future releases. Never sold or shared.</p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-stone-700">Age bracket</span>
                    <select
                      value={profile.age_bracket ?? ''}
                      onChange={(e) => save({ age_bracket: e.target.value || null })}
                      className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 text-stone-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">Prefer not to say</option>
                      {['18-24','25-34','35-44','45-54','55+'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-stone-700">Gender</span>
                    <select
                      value={profile.gender ?? ''}
                      onChange={(e) => save({ gender: e.target.value || null })}
                      className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 text-stone-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non-binary">Non-binary</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-stone-700">Help improve FinClarity</span>
                    <input
                      type="checkbox"
                      checked={profile.analytics_consent}
                      onChange={(e) => save({ analytics_consent: e.target.checked })}
                      className="w-4 h-4 accent-green-600"
                    />
                  </label>
                </div>
              </div>
            </section>

            {/* Privacy */}
            <section className="rounded-2xl bg-stone-50 border border-stone-100 px-5 py-4 space-y-2">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Privacy & Security</p>
              <p className="text-xs text-stone-500">Your PDF is read once and discarded — it is never stored. Passwords for protected PDFs are used for decryption only and never saved. Transactions are stored without any personally identifiable information (no names, addresses, or NRIC).</p>
              <p className="text-xs text-stone-400">FinClarity v{APP_VERSION}</p>
            </section>

            {/* Export */}
            <ExportSection isSignedIn={!!profile.auth_email} />

            {/* Delete account */}
            <section className="rounded-2xl bg-white border border-rose-100">
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-3">Danger Zone</p>
                {!profile.auth_email ? (
                  <p className="text-xs text-amber-600 font-medium">Create an account above to manage account deletion.</p>
                ) : showDeleteConfirm ? (
                  <div className="space-y-3">
                    <p className="text-sm text-stone-700">This permanently deletes all your transactions, statements, reports, and account. <strong>This cannot be undone.</strong></p>
                    <div className="flex gap-3">
                      <button
                        onClick={deleteAccount}
                        disabled={deleting}
                        className="flex-1 rounded-xl bg-rose-600 text-white py-2.5 text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
                      >
                        {deleting ? 'Deleting…' : 'Yes, delete everything'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-xl border border-rose-200 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition"
                  >
                    Delete account
                  </button>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
