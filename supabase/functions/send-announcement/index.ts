import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { subject, message } = await req.json()

  if (!subject?.trim() || !message?.trim()) {
    return new Response(JSON.stringify({ error: 'Sujet et message requis' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: recipients } = await supabase
    .from('profiles')
    .select('email, first_name')
    .eq('has_access', true)
    .not('email', 'is', null)

  if (!recipients?.length) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')!
  let sent = 0
  let errors = 0

  for (const user of recipients) {
    const personalizedHtml = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
        <div style="margin-bottom:24px">
          <span style="font-weight:700;font-size:18px">Code ou Galère</span>
        </div>
        ${user.first_name ? `<p style="margin:0 0 16px;color:#555">Salut ${user.first_name},</p>` : ''}
        <div style="line-height:1.7;white-space:pre-wrap">${message.replace(/\n/g, '<br>')}</div>
        <hr style="margin:32px 0;border:none;border-top:1px solid #eee">
        <p style="font-size:12px;color:#999">Tu reçois cet email car tu as accès à Code ou Galère.</p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Code ou Galère <onboarding@resend.dev>',
        to: user.email,
        subject,
        html: personalizedHtml,
      }),
    })

    if (res.ok) sent++
    else errors++
  }

  return new Response(JSON.stringify({ sent, errors, total: recipients.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
