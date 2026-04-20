import type { ExtractedTransaction } from '@/types'

const TRANSFER_KEYWORDS = [
  'fast transfer',
  'paynow',
  'giro',
  'own account',
  'interbank',
  'fund transfer',
  'internal transfer',
  'telegraphic transfer',
  'tt transfer',
]

function isTransferCandidate(tx: ExtractedTransaction): boolean {
  if (tx.type === 'transfer') return true
  const merchant = tx.merchant.toLowerCase()
  return TRANSFER_KEYWORDS.some((kw) => merchant.includes(kw))
}

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24)
}

function amountsMatch(a: number, b: number): boolean {
  if (a === 0 || b === 0) return false
  return Math.abs(a - b) / Math.max(a, b) <= 0.02 // within ±2%
}

export function detectTransfers(transactions: ExtractedTransaction[]): ExtractedTransaction[] {
  const candidates = transactions.filter(isTransferCandidate)
  const debits = candidates.filter((t) => t.type === 'expense' || t.type === 'transfer')
  const credits = candidates.filter((t) => t.type === 'income' || t.type === 'transfer')

  const matched = new Set<number>()
  const pairMap = new Map<number, string>()

  for (let i = 0; i < debits.length; i++) {
    if (matched.has(transactions.indexOf(debits[i]))) continue

    for (let j = 0; j < credits.length; j++) {
      const creditIdx = transactions.indexOf(credits[j])
      if (matched.has(creditIdx)) continue

      const debitIdx = transactions.indexOf(debits[i])
      if (debitIdx === creditIdx) continue

      if (
        amountsMatch(debits[i].amount, credits[j].amount) &&
        daysBetween(debits[i].date, credits[j].date) <= 3
      ) {
        const pairId = crypto.randomUUID()
        pairMap.set(debitIdx, pairId)
        pairMap.set(creditIdx, pairId)
        matched.add(debitIdx)
        matched.add(creditIdx)
        break
      }
    }
  }

  return transactions.map((tx, idx) => {
    if (pairMap.has(idx)) {
      return { ...tx, type: 'internal_transfer', transferPairId: pairMap.get(idx) }
    }
    return tx
  })
}
