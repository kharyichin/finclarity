'use client'

import { useState } from 'react'

interface Props {
  statementId?: string
  file: File
  onStatementReady?: (statementId: string) => void
  onAnonymousSuccess?: () => void
  onError: (message: string) => void
}

export function PasswordPrompt({ statementId, file, onStatementReady, onAnonymousSuccess, onError }: Props) {
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password.trim()) return

    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('password', password)
      if (statementId) fd.append('statement_id', statementId)

      const res = await fetch('/api/statements/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (data.error) {
        onError(data.error)
        return
      }
      // Anonymous path: pipeline ran in memory
      if (data.anonymous) {
        sessionStorage.setItem('finclarity_pending_upload', JSON.stringify(data))
        onAnonymousSuccess?.()
        return
      }
      onStatementReady?.(data.statement_id)
    } catch {
      onError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
        <span className="text-lg">🔒</span>
        <div>
          <p className="text-sm font-medium text-amber-800">This PDF is password-protected</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Enter the password your bank uses — it won't be stored anywhere.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Statement password"
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
          autoFocus
        />
        <button
          type="submit"
          disabled={!password.trim() || isSubmitting}
          className="rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing…' : 'Unlock and process'}
        </button>
      </form>
    </div>
  )
}
