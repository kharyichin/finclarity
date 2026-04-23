import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const month = request.nextUrl.searchParams.get('month')
  if (!month) return Response.json({ error: 'month param required' }, { status: 400 })

  const { data, error } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('user_id', user.id)
    .eq('month_year', month)
    .single()

  if (error && error.code === 'PGRST116') {
    return Response.json({ empty: true })
  }
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: stmts } = await supabase
    .from('statements')
    .select('statement_type')
    .eq('user_id', user.id)
    .eq('month_year', month)
    .eq('status', 'complete')

  const hasBankAccount = stmts?.some((s) => s.statement_type === 'bank_account') ?? false
  const creditCardOnly = !hasBankAccount

  return Response.json({ ...data, creditCardOnly })
}
