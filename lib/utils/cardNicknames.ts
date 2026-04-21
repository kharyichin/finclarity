'use client'

const STORAGE_KEY = 'finclarity_card_nicknames'

export function getCardNicknames(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function setCardNickname(accountLast4: string, nickname: string) {
  const all = getCardNicknames()
  if (nickname.trim()) {
    all[accountLast4] = nickname.trim()
  } else {
    delete all[accountLast4]
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function getCardLabel(bankName: string | null, accountLast4: string | null): string {
  if (!accountLast4) return bankName ?? 'Unknown Account'
  const nicknames = getCardNicknames()
  const nickname = nicknames[accountLast4]
  const base = nickname ?? bankName ?? 'Unknown'
  return `${base} ···${accountLast4}`
}
