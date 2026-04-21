import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  const supabase = await createClient()
  const today = new Date().getDate()

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, check_in_day')
    .eq('check_in_day', today)
    .not('email', 'is', null)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const results = await Promise.allSettled(
    (users ?? []).map(async (user) => {
      await resend.emails.send({
        from: 'FinClarity <hello@finclarity.app>',
        to: user.email!,
        subject: 'Time to check in on your finances',
        html: `
          <p>Hi there,</p>
          <p>Today's your check-in day. Upload your latest bank statement to keep your streak going and see how this month compares.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://finclarity.app'}/dashboard">Open FinClarity →</a></p>
          <p style="color:#999;font-size:12px">You're getting this because you set today as your monthly check-in day. Change it anytime in Settings.</p>
        `,
      })
    })
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return Response.json({ sent, total: (users ?? []).length })
}
