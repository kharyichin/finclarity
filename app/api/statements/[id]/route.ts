import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: statement } = await supabase
    .from('statements')
    .select('status, bank_name, month_year')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!statement) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json(statement)
}
