import type { ExtractedTransaction } from '@/types'

export interface ExtractResult {
  transactions: ExtractedTransaction[]
  bankName: string
  statementType: 'credit_card' | 'bank_account'
  accountLast4: string
  dateRange: { start: string; end: string }
  detectedCurrency: string
}

// Stub — real Claude extraction wired in step 5
export async function extractTransactions(_rawText: string): Promise<ExtractResult> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    transactions: [],
    bankName: 'Unknown Bank',
    statementType: 'bank_account',
    accountLast4: '0000',
    dateRange: {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    },
    detectedCurrency: 'SGD',
  }
}
