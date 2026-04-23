import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('statements')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // For each statement, fetch distinct accounts from transactions
  const statements = data ?? []
  const enriched = await Promise.all(
    statements.map(async (s) => {
      const { data: txAccounts } = await supabase
        .from('transactions')
        .select('account_last4, bank_name')
        .eq('statement_id', s.id)
        .not('account_last4', 'is', null)

      const accounts = [...new Map(
        (txAccounts ?? []).map((t) => [t.account_last4, { last4: t.account_last4, bank_name: t.bank_name }])
      ).values()]

      return { ...s, accounts }
    })
  )

  return Response.json(enriched)
}
