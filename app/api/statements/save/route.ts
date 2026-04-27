export const maxDuration = 60

import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { report, rawTransactions, meta } = body

    if (!report || !meta) {
      return Response.json({ error: 'Missing payload' }, { status: 400 })
    }

    // Ensure users row exists
    await supabase
      .from('users')
      .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })

    const bankDisplay = meta.isConsolidated
      ? meta.bankName
      : meta.cardName
        ? `${meta.bankName} ${meta.cardName}`
        : meta.bankName

    // Create statement row — original bytes unavailable so use a generated hash
    const fileHash = `saved-${crypto.randomUUID()}`
    const { data: statement, error: stmtErr } = await supabase
      .from('statements')
      .insert({
        user_id: user.id,
        file_hash: fileHash,
        bank_name: bankDisplay,
        statement_type: meta.statementType,
        account_last4: meta.isConsolidated ? null : meta.accountLast4,
        month_year: meta.monthYear,
        period_start: meta.dateRange.start,
        period_end: meta.dateRange.end,
        status: 'complete',
      })
      .select('id')
      .single()

    if (stmtErr || !statement) {
      console.error('[save] statement insert error:', stmtErr)
      return Response.json({ error: 'Failed to create statement' }, { status: 500 })
    }

    // Insert transactions
    if (Array.isArray(rawTransactions) && rawTransactions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('transactions').insert(
        rawTransactions.map((tx: Record<string, unknown>) => ({
          user_id: user.id,
          statement_id: statement.id,
          date: tx.date,
          merchant: tx.merchant,
          amount: tx.amount,
          currency: tx.currency,
          sgd_amount: (tx.bankRateSGD as number) ?? tx.amount,
          original_amount: tx.originalAmount,
          bank_rate: tx.bankRate,
          bank_rate_sgd: tx.bankRateSGD,
          claude_category: tx.category,
          type: tx.type,
          transfer_pair_id: tx.transferPairId ?? null,
          account_last4: tx.accountLast4 || meta.accountLast4,
          bank_name: bankDisplay,
          month_year: meta.monthYear,
          exchange_rate_source: tx.bankRate ? 'bank' : null,
        }))
      )
    }

    // Upsert monthly_reports
    await supabase.from('monthly_reports').upsert(
      {
        user_id: user.id,
        month_year: meta.monthYear,
        narrative_text: report.narrative_text,
        summary_cards_json: report.summary_cards_json,
        observations_json: report.observations_json,
        nudges_json: report.nudges_json,
        prompt_version: report.prompt_version ?? '1.0',
      },
      { onConflict: 'user_id,month_year' }
    )

    // Upsert check_ins
    await supabase
      .from('check_ins')
      .upsert(
        { user_id: user.id, month_year: meta.monthYear },
        { onConflict: 'user_id,month_year' }
      )

    return Response.json({ success: true })
  } catch (err) {
    console.error('[save] error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
