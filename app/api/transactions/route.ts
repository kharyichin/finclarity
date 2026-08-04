import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const month = searchParams.get('month')
  const category = searchParams.get('category')
  const type = searchParams.get('type')
  const account_last4 = searchParams.get('account_last4')

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (month) query = query.eq('month_year', month)
  if (category) query = query.eq('user_category', category)
  if (type) query = query.eq('type', type)
  if (account_last4) query = query.eq('account_last4', account_last4)

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data ?? [])
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { id?: string; user_category?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const id = typeof body.id === 'string' ? body.id.trim() : ''
  const user_category = typeof body.user_category === 'string' ? body.user_category.trim() : ''

  if (!id) {
    return Response.json({ error: 'id is required' }, { status: 400 })
  }

  const allowed = [
    'Food & Dining',
    'Transport',
    'Shopping',
    'Utilities',
    'Entertainment',
    'Health',
    'Travel',
    'Income',
    'Cashback',
    'Transfer',
    'Refund & Reversal',
    'Other',
  ]

  if (!allowed.includes(user_category)) {
    return Response.json({ error: 'Invalid category' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('transactions')
    .update({ user_category })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .maybeSingle()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return Response.json({ error: 'Transaction not found' }, { status: 404 })
  }

  return Response.json(data)
}

