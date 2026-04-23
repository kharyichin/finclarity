import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: statement } = await supabase
    .from('statements')
    .select('status, bank_name, month_year')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!statement) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(statement)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Confirm ownership and get month_year before deleting
  const { data: statement } = await supabase
    .from('statements')
    .select('id, month_year')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!statement) return Response.json({ error: 'Not found' }, { status: 404 })

  // Delete transactions belonging to this statement
  await supabase.from('transactions').delete().eq('statement_id', id)

  // Delete the statement row
  await supabase.from('statements').delete().eq('id', id)

  // If no other statements exist for the same month, remove the monthly report and check-in
  if (statement.month_year) {
    const { data: remaining } = await supabase
      .from('statements')
      .select('id')
      .eq('user_id', user.id)
      .eq('month_year', statement.month_year)

    if (!remaining || remaining.length === 0) {
      await supabase.from('monthly_reports').delete()
        .eq('user_id', user.id).eq('month_year', statement.month_year)
      await supabase.from('check_ins').delete()
        .eq('user_id', user.id).eq('month_year', statement.month_year)
    }
  }

  return Response.json({ ok: true })
}
