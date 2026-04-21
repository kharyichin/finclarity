'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'finclarity_card_nicknames'

function load(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

interface CardNicknamesCtx {
  nicknames: Record<string, string>
  setNickname: (accountLast4: string, nickname: string) => void
  getLabel: (bankName: string | null, accountLast4: string | null) => string
}

const CardNicknamesContext = createContext<CardNicknamesCtx>({
  nicknames: {},
  setNickname: () => {},
  getLabel: (bankName, last4) => [bankName, last4 ? `···${last4}` : ''].filter(Boolean).join(' '),
})

export function CardNicknamesProvider({ children }: { children: React.ReactNode }) {
  const [nicknames, setNicknames] = useState<Record<string, string>>({})

  useEffect(() => { setNicknames(load()) }, [])

  const setNickname = useCallback((accountLast4: string, nickname: string) => {
    setNicknames((prev) => {
      const next = { ...prev }
      if (nickname.trim()) {
        next[accountLast4] = nickname.trim()
      } else {
        delete next[accountLast4]
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const getLabel = useCallback((bankName: string | null, accountLast4: string | null): string => {
    if (!accountLast4) return bankName ?? 'Unknown Account'
    const nick = nicknames[accountLast4]
    return `${nick ?? bankName ?? 'Unknown'} ···${accountLast4}`
  }, [nicknames])

  return (
    <CardNicknamesContext.Provider value={{ nicknames, setNickname, getLabel }}>
      {children}
    </CardNicknamesContext.Provider>
  )
}

export function useCardNicknames() {
  return useContext(CardNicknamesContext)
}
