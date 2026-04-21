import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const rows = data ?? []
  const header = 'date,merchant,amount,currency,sgd_amount,category,account,bank,type\n'
  const body = rows.map((tx) => [
    tx.date,
    `"${(tx.merchant ?? '').replace(/"/g, '""')}"`,
    tx.amount,
    tx.currency,
    tx.sgd_amount ?? tx.amount,
    `"${(tx.user_category ?? tx.claude_category ?? 'Other').replace(/"/g, '""')}"`,
    tx.account_last4 ?? '',
    `"${(tx.bank_name ?? '').replace(/"/g, '""')}"`,
    tx.type,
  ].join(',')).join('\n')

  return new Response(header + body, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="finclarity-export.csv"',
    },
  })
}
