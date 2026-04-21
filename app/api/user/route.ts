import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ...data, auth_email: user.email })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const allowed = ['check_in_day', 'theme', 'age_bracket', 'gender', 'analytics_consent']
  const patch = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  const { error } = await supabase.from('users').update(patch).eq('id', user.id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Cascade delete handled by DB foreign keys — deleting from users removes everything
  const { error } = await supabase.from('users').delete().eq('id', user.id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  await supabase.auth.signOut()
  return Response.json({ ok: true })
}
