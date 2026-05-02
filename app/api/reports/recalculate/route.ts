import { createClient } from '@/lib/supabase/server'
import { generateReport } from '@/lib/claude/narrative'
import { NextRequest } from 'next/server'
import type { TransactionSummary } from '@/types'

function getTopCategory(rows: { category: string; amount: number }[]): string {
  if (!rows.length) return 'Other'
  const totals: Record<string, number> = {}
  for (const { category, amount } of rows) {
    totals[category] = (totals[category] ?? 0) + amount
  }
  return Object.entries(totals).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'Other'
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { month } = await request.json()
  if (!month) return Response.json({ error: 'month required' }, { status: 400 })

  // Fetch all transactions for this month
  const { data: txRows } = await supabase
    .from('transactions')
    .select('type, claude_category, sgd_amount, amount')
    .eq('user_id', user.id)
    .eq('month_year', month)

  if (!txRows || txRows.length === 0) {
    return Response.json({ error: 'No transactions found for this month' }, { status: 404 })
  }

  // Fix misclassified transactions: type='expense' but category='Transfer' is a
  // contradiction — these are fund movements, not purchases. Reclassify in DB.
  const hasMisclassified = txRows.some(
    (t) => t.type === 'expense' && (t.claude_category === 'Transfer' || t.claude_category === 'Internal Transfer')
  )
  let cleanTxRows = txRows
  if (hasMisclassified) {
    await supabase
      .from('transactions')
      .update({ type: 'transfer' })
      .eq('user_id', user.id)
      .eq('month_year', month)
      .eq('type', 'expense')
      .in('claude_category', ['Transfer', 'Internal Transfer'])
    const { data: fixed } = await supabase
      .from('transactions')
      .select('type, claude_category, sgd_amount, amount')
      .eq('user_id', user.id)
      .eq('month_year', month)
    cleanTxRows = fixed ?? txRows
  }

  // Determine if any bank account statement exists for this month
  const { data: stmts } = await supabase
    .from('statements')
    .select('statement_type')
    .eq('user_id', user.id)
    .eq('month_year', month)
    .eq('status', 'complete')

  const hasBankAccount = stmts?.some((s) => s.statement_type === 'bank_account') ?? false

  // Recompute metrics from cleaned data
  const expenses = cleanTxRows.filter((t) => t.type === 'expense')
  const income = cleanTxRows.filter(
    (t) => t.type === 'income' && t.claude_category !== 'Refund & Reversal' && t.claude_category !== 'Interest'
  )

  const totalSpent = expenses.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
  const totalIncome = income.reduce((s, t) => s + (t.sgd_amount ?? t.amount), 0)
  const topCategory = getTopCategory(
    expenses.map((t) => ({ category: t.claude_category ?? 'Other', amount: t.sgd_amount ?? t.amount }))
  )

  const summary: TransactionSummary = {
    month_year: month,
    total_spent: totalSpent,
    total_saved: hasBankAccount ? totalIncome - totalSpent : totalIncome,
    top_category: topCategory,
    transactions: [],
  }

  const report = await generateReport({
    currentMonth: summary,
    priorMonth: null,
    last3Months: null,
    statementType: hasBankAccount ? 'bank_account' : 'credit_card',
  })

  await supabase.from('monthly_reports').upsert(
    {
      user_id: user.id,
      month_year: month,
      narrative_text: report.narrative,
      summary_cards_json: report.summaryCards,
      observations_json: report.observations,
      nudges_json: report.nudges,
      prompt_version: '1.1',
    },
    { onConflict: 'user_id,month_year' }
  )

  return Response.json({ ok: true })
}
