'use client'

import { useEffect, useRef } from 'react'

interface Props {
  statementId: string
  onNeedsPassword: () => void
  onSuccess: () => void
  onError: (message: string) => void
}

const MESSAGES = [
  'Reading your statement…',
  'Identifying transactions…',
  'Organising everything…',
  'Almost there…',
]

export function ProcessingState({ statementId, onNeedsPassword, onSuccess, onError }: Props) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const msgIndex = useRef(0)
  const msgEl = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    let attempts = 0
    const MAX_ATTEMPTS = 90 // 3 minutes at 2s intervals

    intervalRef.current = setInterval(async () => {
      attempts++
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(intervalRef.current!)
        onError('Processing is taking longer than expected. Please try again.')
        return
      }

      // Cycle through loading messages
      if (msgEl.current) {
        msgEl.current.textContent = MESSAGES[msgIndex.current % MESSAGES.length]
        msgIndex.current++
      }

      try {
        const res = await fetch(`/api/statements/${statementId}`)
        const data = await res.json()

        if (data.status === 'needs_password') {
          clearInterval(intervalRef.current!)
          onNeedsPassword()
        } else if (data.status === 'complete') {
          clearInterval(intervalRef.current!)
          onSuccess()
        } else if (data.status === 'failed') {
          clearInterval(intervalRef.current!)
          onError('No transactions found. Make sure you\'re uploading a bank or credit card statement PDF.')
        }
      } catch {
        // Network hiccup — keep polling
      }
    }, 2000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [statementId, onNeedsPassword, onSuccess, onError])

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-green-100" />
        <div className="absolute h-16 w-16 rounded-full border-4 border-t-green-500 animate-spin" />
        <span className="absolute text-2xl">🌿</span>
      </div>
      <div className="text-center">
        <p
          ref={msgEl}
          className="text-sm font-medium text-stone-600 transition-all"
        >
          Reading your statement…
        </p>
        <p className="text-xs text-stone-400 mt-1">This usually takes under a minute</p>
      </div>
    </div>
  )
}
