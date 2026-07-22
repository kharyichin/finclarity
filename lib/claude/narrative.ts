import Anthropic from '@anthropic-ai/sdk'
import type { TransactionSummary, SummaryCards, Observation, Nudge } from '@/types'

const client = new Anthropic()

export async function generateReport(params: {
  currentMonth: TransactionSummary
  priorMonth: TransactionSummary | null
  last3Months: TransactionSummary[] | null
  statementType?: string | null
}): Promise<{
  narrative: string
  summaryCards: SummaryCards
  observations: Observation[]
  nudges: Nudge[]
}> {
  const { currentMonth, priorMonth, last3Months, statementType } = params
  const creditCardOnly = statementType === 'credit_card'

  const priorContext = priorMonth
    ? `Prior month (${priorMonth.month_year}): spent SGD ${priorMonth.total_spent.toFixed(2)}, saved SGD ${priorMonth.total_saved.toFixed(2)}, top category: ${priorMonth.top_category}.`
    : 'No prior month data available.'

  const historyContext =
    last3Months && last3Months.length > 0
      ? `Last ${last3Months.length} months: ${last3Months.map((m) => `${m.month_year} spent ${m.total_spent.toFixed(2)}`).join(', ')}.`
      : 'No multi-month history available.'

  const topCategories = getTopCategories(currentMonth)

  const deltaHint = priorMonth
    ? `Month-over-month change in spend: SGD ${(currentMonth.total_spent - priorMonth.total_spent).toFixed(2)} (${currentMonth.total_spent >= priorMonth.total_spent ? 'up' : 'down'} vs prior).`
    : 'First month in view — describe the shape of spending, not a comparison.'

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You write short monthly money notes for Singapore users. Tone: calm friend who understands money — warm, direct, never preachy, never corporate, never "AI assistant".

Write a monthly picture. Return ONLY valid JSON (no markdown, no fences).

Current month: ${currentMonth.month_year}
Statement type: ${creditCardOnly ? 'Credit card only — no bank account data. Do NOT mention savings or income.' : 'Bank account — income and savings figures are available.'}
Total spent (expenses only): SGD ${currentMonth.total_spent.toFixed(2)}
${creditCardOnly ? '' : `Net saved this month: SGD ${currentMonth.total_saved.toFixed(2)}`}
Top spending category: ${currentMonth.top_category}
Category breakdown: ${topCategories}
${priorContext}
${historyContext}
${deltaHint}

Return this exact JSON shape:
{
  "narrative": "2–3 sentences. Lead with what changed or what stands out this month (good or hard). Prefer concrete category or habit language over repeating raw totals. If prior month exists, say what moved and why it might have. Never lecture. Never start with 'This month you...' every time — vary openings.${creditCardOnly ? ' Do not mention savings or income.' : ''}",
  "watchout": "One short warm forward-looking note for next month — specific if you can, otherwise a gentle practical tip.",
  "observations": [],
  "nudges": []
}

Rules:
- Only populate observations if there is a genuine pattern (new charge, changed amount, spike). Empty array is fine.
- nudges: 1–2 max. Empty array is fine.
- Do NOT include spent/saved/top_category fields — those are computed server-side.
- No exclamation spam. No emoji. No financial advice.
- Return valid JSON only.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude narrative')
  }

  let parsed: {
    narrative?: string
    watchout?: string
    observations?: Observation[]
    nudges?: Nudge[]
  }

  try {
    const text = content.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    parsed = JSON.parse(text)
  } catch {
    parsed = {}
  }

  const summaryCards: SummaryCards = {
    spent: currentMonth.total_spent,
    saved: creditCardOnly ? 0 : currentMonth.total_saved,
    top_category: currentMonth.top_category || 'Other',
    watchout: parsed.watchout || 'Keep uploading statements to unlock more insights.',
  }

  return {
    narrative:
      parsed.narrative ||
      `You spent SGD ${currentMonth.total_spent.toFixed(2)} this month, with most going towards ${currentMonth.top_category || 'everyday expenses'}. Keep uploading statements to unlock month-over-month insights.`,
    summaryCards,
    observations: parsed.observations || [],
    nudges: parsed.nudges || [],
  }
}

function getTopCategories(summary: TransactionSummary): string {
  if (!summary.transactions || summary.transactions.length === 0) {
    return summary.top_category ? `${summary.top_category}: SGD ${summary.total_spent.toFixed(2)}` : 'No transactions'
  }

  const totals: Record<string, number> = {}
  for (const tx of summary.transactions) {
    if (tx.type === 'expense') {
      const cat = tx.user_category || tx.claude_category || 'Other'
      totals[cat] = (totals[cat] ?? 0) + (tx.sgd_amount ?? tx.amount)
    }
  }

  return Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: SGD ${amt.toFixed(2)}`)
    .join(', ')
}
