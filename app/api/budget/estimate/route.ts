import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: transactions } = await supabase
    .from('transactions')
    .select('claude_category, sgd_amount, amount, month_year, type')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .order('month_year', { ascending: false })
    .limit(600)

  if (!transactions || transactions.length === 0) {
    return Response.json({ estimates: {}, monthsAnalyzed: 0 })
  }

  // Group spend by month then category
  const byMonthCat: Record<string, Record<string, number>> = {}
  for (const tx of transactions) {
    const month = tx.month_year ?? 'unknown'
    const cat = tx.claude_category ?? 'Other'
    const amt = tx.sgd_amount ?? tx.amount
    if (!byMonthCat[month]) byMonthCat[month] = {}
    byMonthCat[month][cat] = (byMonthCat[month][cat] ?? 0) + amt
  }

  const months = Object.keys(byMonthCat).sort().slice(-3)
  const monthsAnalyzed = months.length

  // Average per category across those months
  const catTotals: Record<string, number[]> = {}
  for (const month of months) {
    for (const [cat, total] of Object.entries(byMonthCat[month])) {
      if (!catTotals[cat]) catTotals[cat] = []
      catTotals[cat].push(total)
    }
  }
  const averages: Record<string, number> = {}
  for (const [cat, totals] of Object.entries(catTotals)) {
    averages[cat] = totals.reduce((s, v) => s + v, 0) / monthsAnalyzed
  }

  if (Object.keys(averages).length === 0) {
    return Response.json({ estimates: {}, monthsAnalyzed })
  }

  const lines = Object.entries(averages)
    .map(([cat, avg]) => `- ${cat}: SGD ${avg.toFixed(0)}`)
    .join('\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are helping a user set realistic monthly spending budgets. Based on their recent spending, suggest a monthly budget for each category.

Average monthly spending (last ${monthsAnalyzed} month${monthsAnalyzed > 1 ? 's' : ''}):
${lines}

Rules:
- Add roughly 10–15% above the average as a reasonable buffer
- Round to the nearest 50
- Keep minimum at 50 for any category with real spending
- Return JSON only, no explanation or markdown: {"Category": amount}`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') {
    return Response.json({ estimates: averages, monthsAnalyzed })
  }

  try {
    const match = block.text.match(/\{[\s\S]*\}/)
    const estimates = match ? JSON.parse(match[0]) : averages
    return Response.json({ estimates, monthsAnalyzed })
  } catch {
    return Response.json({ estimates: averages, monthsAnalyzed })
  }
}
