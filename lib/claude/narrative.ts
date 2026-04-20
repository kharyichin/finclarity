import type { TransactionSummary, SummaryCards, Observation, Nudge } from '@/types'

// Stub — real Claude narrative wired in step 5
export async function generateReport(params: {
  currentMonth: TransactionSummary
  priorMonth: TransactionSummary | null
  last3Months: TransactionSummary[] | null
}): Promise<{
  narrative: string
  summaryCards: SummaryCards
  observations: Observation[]
  nudges: Nudge[]
}> {
  const { currentMonth } = params
  return {
    narrative: 'Your statement has been processed successfully.',
    summaryCards: {
      spent: currentMonth.total_spent,
      saved: currentMonth.total_saved,
      top_category: currentMonth.top_category || 'Uncategorised',
      watchout: 'Upload more statements to unlock insights.',
    },
    observations: [],
    nudges: [],
  }
}
