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

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a warm, friendly personal finance companion — like a supportive friend who happens to understand money well. You're non-judgmental, encouraging, and direct.

Generate a monthly financial summary report. Return ONLY valid JSON, no markdown, no explanation.

Current month: ${currentMonth.month_year}
Statement type: ${creditCardOnly ? 'Credit card only — no bank account data uploaded. Income and savings figures are NOT available and must not be mentioned.' : 'Bank account data available — income and savings figures are reliable.'}
Total spent: SGD ${currentMonth.total_spent.toFixed(2)}
${creditCardOnly ? '' : `Total income: SGD ${currentMonth.total_saved.toFixed(2)}`}
Top spending category: ${currentMonth.top_category}
Category breakdown: ${topCategories}
${priorContext}
${historyContext}

${creditCardOnly ? 'IMPORTANT: This is a credit card statement only. Do NOT mention savings, income, money earned, or money saved. Focus entirely on spending patterns and categories.' : ''}

Return this exact JSON structure:
{
  "narrative": "2-3 warm, conversational sentences. Lead with something positive or a genuine observation. If the month was tough, acknowledge it honestly then pivot to something constructive. Never preachy. Sound like a friend, not a bank.${creditCardOnly ? ' Do not mention savings or income.' : ''}",
  "summaryCards": {
    "spent": ${currentMonth.total_spent},
    "saved": ${creditCardOnly ? 0 : currentMonth.total_saved},
    "top_category": "${currentMonth.top_category || 'Other'}",
    "watchout": "One short forward-looking note — something to keep an eye on next month. Warm tone, not alarming."
  },
  "observations": [
    {
      "type": "string — 'new_charge' | 'missing_charge' | 'amount_changed' | 'spending_spike'",
      "message": "Warm, conversational observation. Like: 'Looks like your Netflix went up by $2 this month.'",
      "merchant": "merchant name or null",
      "amount_change": number or null
    }
  ],
  "nudges": [
    {
      "message": "One forward-looking nudge. Predictive, not prescriptive. Like: 'Your phone bill usually lands around the 15th — worth keeping some buffer.'",
      "pattern": "brief description of the pattern spotted or null",
      "predicted_date": "YYYY-MM-DD or null"
    }
  ]
}

Rules:
- observations array: only include if you can genuinely identify a pattern from the data. Empty array is fine for first-time users.
- nudges array: 1-2 items max. Empty array is fine.
- All money amounts in SGD.
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
    summaryCards?: SummaryCards
    observations?: Observation[]
    nudges?: Nudge[]
  }

  try {
    const text = content.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    parsed = JSON.parse(text)
  } catch {
    // Fallback if JSON parsing fails
    parsed = {}
  }

  return {
    narrative:
      parsed.narrative ||
      `You spent SGD ${currentMonth.total_spent.toFixed(2)} this month, with most going towards ${currentMonth.top_category || 'everyday expenses'}. Keep uploading statements to unlock month-over-month insights.`,
    summaryCards: parsed.summaryCards || {
      spent: currentMonth.total_spent,
      saved: currentMonth.total_saved,
      top_category: currentMonth.top_category || 'Other',
      watchout: 'Upload more statements to unlock insights.',
    },
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
