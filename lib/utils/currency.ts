import type { Transaction } from '@/types'

export function formatTransaction(tx: Transaction): {
  primaryDisplay: string
  secondaryDisplay: string | null
  rateAttribution: string | null
} {
  const sgd = tx.sgd_amount ?? tx.amount
  const primaryDisplay = `${sgd.toFixed(2)} SGD`

  let secondaryDisplay: string | null = null
  if (tx.currency !== 'SGD') {
    // original_amount holds the foreign currency amount; fall back to amount if null
    const foreignAmt = tx.original_amount ?? tx.amount
    secondaryDisplay = `${foreignAmt.toFixed(2)} ${tx.currency}`
  }

  let rateAttribution: string | null = null
  if (tx.exchange_rate_source === 'bank') {
    rateAttribution = 'Bank rate applied'
  } else if (tx.exchange_rate_source === 'estimated') {
    const dateStr = tx.date
      ? new Date(tx.date).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })
      : ''
    rateAttribution = `Estimated — converted at rate as of ${dateStr}`
  }

  return { primaryDisplay, secondaryDisplay, rateAttribution }
}
