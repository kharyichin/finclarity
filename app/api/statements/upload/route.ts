export const maxDuration = 120

import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { parsePDF } from '@/lib/pdf/parse'
import { extractTransactions } from '@/lib/claude/extract'
import { generateReport } from '@/lib/claude/narrative'
import { detectTransfers } from '@/lib/utils/transfers'
import type { TransactionSummary } from '@/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const password = (formData.get('password') as string) || undefined
    const existingStatementId = formData.get('statement_id') as string | null

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileBytes = Buffer.from(await file.arrayBuffer())

    // Anonymous users: run full pipeline in memory, never write to DB
    if (user.is_anonymous) {
      const result = await runAnonymousPipeline(fileBytes, password)
      return Response.json(result)
    }

    // Ensure users row exists — trigger may not fire on new Supabase projects
    const { error: upsertErr } = await supabase.from('users').upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })
    if (upsertErr) console.error('[upload] users upsert error:', upsertErr.code, upsertErr.message)

    // Password retry — re-run pipeline on existing statement
    if (existingStatementId) {
      await runPipeline(existingStatementId, fileBytes, password)
      return Response.json({ statement_id: existingStatementId })
    }

    // SHA-256 duplicate check — only block if the statement completed successfully
    const fileHash = crypto.createHash('sha256').update(fileBytes).digest('hex')
    const { data: existing } = await supabase
      .from('statements')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('file_hash', fileHash)
      .maybeSingle()

    if (existing?.status === 'complete') {
      return Response.json({ duplicate: true, existing_id: existing.id })
    }

    // If a failed/stuck statement exists for this hash, delete it and re-process
    if (existing) {
      await supabase.from('statements').delete().eq('id', existing.id)
    }

    const { data: statement, error } = await supabase
      .from('statements')
      .insert({ user_id: user.id, file_hash: fileHash, status: 'processing' })
      .select('id')
      .single()

    if (error || !statement) {
      console.error('[upload] insert statement error:', error?.code, error?.message)
      return Response.json({ error: 'Failed to create statement', detail: error?.message, code: error?.code }, { status: 500 })
    }

    await runPipeline(statement.id, fileBytes, password)
    return Response.json({ statement_id: statement.id })
  } catch (err) {
    console.error('[upload] unhandled error:', err)
    return Response.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}

async function runPipeline(statementId: string, fileBytes: Buffer, password?: string) {
  const supabase = await createClient()

  try {
    const parsed = await parsePDF(fileBytes, password)

    if (parsed.needsPassword) {
      await supabase
        .from('statements')
        .update({ status: 'needs_password' })
        .eq('id', statementId)
      return
    }

    const extracted = await extractTransactions(parsed.text)
    const monthYear = extracted.dateRange.start.substring(0, 7)
    const transactions = detectTransfers(extracted.transactions)

    const { data: stmt } = await supabase
      .from('statements')
      .select('user_id')
      .eq('id', statementId)
      .single()

    if (!stmt) return

    if (transactions.length === 0) {
      await supabase
        .from('statements')
        .update({ status: 'failed' })
        .eq('id', statementId)
      return
    }

    const distinctAccounts = [...new Set(transactions.map((t) => t.accountLast4).filter(Boolean))]
    const isConsolidated = distinctAccounts.length > 1

    const expenses = transactions.filter((t) => t.type === 'expense')
    // Reversals cancel a previous charge — exclude from savings total
    const trueIncome = transactions.filter(
      (t) => t.type === 'income' && t.category !== 'Refund & Reversal'
    )
    const topCategory = getTopCategory(expenses)

    const currentSummary: TransactionSummary = {
      month_year: monthYear,
      total_spent: expenses.reduce((sum, t) => sum + t.amount, 0),
      total_saved: trueIncome.reduce((sum, t) => sum + t.amount, 0),
      top_category: topCategory,
      transactions: [],
    }

    const report = await generateReport({
      currentMonth: currentSummary,
      priorMonth: null,
      last3Months: null,
      statementType: extracted.statementType,
    })

    if (transactions.length > 0) {
      await supabase.from('transactions').insert(
        transactions.map((tx) => ({
          user_id: stmt.user_id,
          statement_id: statementId,
          date: tx.date,
          merchant: tx.merchant,
          amount: tx.amount,
          currency: tx.currency,
          sgd_amount: tx.bankRateSGD ?? tx.amount,
          original_amount: tx.originalAmount,
          bank_rate: tx.bankRate,
          bank_rate_sgd: tx.bankRateSGD,
          claude_category: tx.category,
          type: tx.type,
          transfer_pair_id: tx.transferPairId ?? null,
          account_last4: tx.accountLast4 || extracted.accountLast4,
          bank_name: extracted.cardName
            ? `${extracted.bankName} ${extracted.cardName}`
            : extracted.bankName,
          month_year: monthYear,
          exchange_rate_source: tx.bankRate ? 'bank' : null,
        }))
      )
    }

    await supabase
      .from('monthly_reports')
      .upsert(
        {
          user_id: stmt.user_id,
          month_year: monthYear,
          narrative_text: report.narrative,
          summary_cards_json: report.summaryCards,
          observations_json: report.observations,
          nudges_json: report.nudges,
          prompt_version: '1.0',
        },
        { onConflict: 'user_id,month_year' }
      )

    await supabase
      .from('check_ins')
      .upsert(
        { user_id: stmt.user_id, month_year: monthYear },
        { onConflict: 'user_id,month_year' }
      )

    await supabase
      .from('statements')
      .update({
        status: 'complete',
        bank_name: isConsolidated
          ? extracted.bankName
          : extracted.cardName
            ? `${extracted.bankName} ${extracted.cardName}`
            : extracted.bankName,
        statement_type: extracted.statementType,
        account_last4: isConsolidated ? null : extracted.accountLast4,
        month_year: monthYear,
        period_start: extracted.dateRange.start,
        period_end: extracted.dateRange.end,
      })
      .eq('id', statementId)
  } catch (err) {
    console.error('[upload pipeline]', err)
    await supabase.from('statements').update({ status: 'failed' }).eq('id', statementId)
  }
}

function getTopCategory(expenses: Array<{ category: string; amount: number }>): string {
  if (!expenses.length) return 'None'
  const totals: Record<string, number> = {}
  for (const tx of expenses) {
    totals[tx.category] = (totals[tx.category] ?? 0) + tx.amount
  }
  return Object.entries(totals).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'None'
}

async function runAnonymousPipeline(fileBytes: Buffer, password?: string): Promise<object> {
  try {
    const parsed = await parsePDF(fileBytes, password)

    if (parsed.needsPassword) {
      return { needsPassword: true }
    }

    const extracted = await extractTransactions(parsed.text)
    const monthYear = extracted.dateRange.start.substring(0, 7)
    const transactions = detectTransfers(extracted.transactions)

    if (transactions.length === 0) {
      return { error: "No transactions found. Make sure you're uploading a bank or credit card statement PDF." }
    }

    const distinctAccounts = [...new Set(transactions.map((t) => t.accountLast4).filter(Boolean))]
    const isConsolidated = distinctAccounts.length > 1

    const expenses = transactions.filter((t) => t.type === 'expense')
    const trueIncome = transactions.filter(
      (t) => t.type === 'income' && t.category !== 'Refund & Reversal'
    )
    const topCategory = getTopCategory(expenses)

    const currentSummary: TransactionSummary = {
      month_year: monthYear,
      total_spent: expenses.reduce((sum, t) => sum + t.amount, 0),
      total_saved: trueIncome.reduce((sum, t) => sum + t.amount, 0),
      top_category: topCategory,
      transactions: [],
    }

    const report = await generateReport({
      currentMonth: currentSummary,
      priorMonth: null,
      last3Months: null,
      statementType: extracted.statementType,
    })

    return {
      anonymous: true,
      report: {
        month_year: monthYear,
        narrative_text: report.narrative,
        summary_cards_json: report.summaryCards,
        observations_json: report.observations,
        nudges_json: report.nudges,
        generated_at: new Date().toISOString(),
        prompt_version: '1.0',
      },
      creditCardOnly: extracted.statementType === 'credit_card',
      rawTransactions: transactions,
      meta: {
        bankName: extracted.bankName,
        cardName: extracted.cardName,
        accountLast4: extracted.accountLast4,
        statementType: extracted.statementType,
        dateRange: extracted.dateRange,
        monthYear,
        isConsolidated,
      },
    }
  } catch (err) {
    console.error('[anonymous pipeline]', err)
    return { error: 'Processing failed. Please try again.' }
  }
}
