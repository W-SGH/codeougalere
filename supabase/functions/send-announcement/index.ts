import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Vérifier que l'appelant est authentifié
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Vérifier que l'utilisateur est admin
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders })
  }

  const { subject, message } = await req.json()

  if (!subject?.trim() || !message?.trim()) {
    return new Response(JSON.stringify({ error: 'Sujet et message requis' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Les emails sont dans auth.users, pas dans profiles
  const { data: accessProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id, first_name')
    .eq('has_access', true)

  if (!accessProfiles?.length) {
    return new Response(JSON.stringify({ sent: 0, errors: 0, total: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

  const recipients = accessProfiles
    .map(p => ({ first_name: p.first_name, email: users.find(u => u.id === p.id)?.email }))
    .filter(r => !!r.email)

  if (!recipients.length) {
    return new Response(JSON.stringify({ sent: 0, errors: 0, total: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')!
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>')
  const safeSubject = escapeHtml(subject)
  let sent = 0
  let errors = 0

  for (const recipient of recipients) {
    const safeName = recipient.first_name ? escapeHtml(recipient.first_name) : ''
    const personalizedHtml = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
        <div style="margin-bottom:24px">
          <span style="font-weight:700;font-size:18px">Code ou Galère</span>
        </div>
        ${safeName ? `<p style="margin:0 0 16px;color:#555">Salut ${safeName},</p>` : ''}
        <div style="line-height:1.7;white-space:pre-wrap">${safeMessage}</div>
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
        from: 'Code ou Galère <noreply@codeougalere.fr>',
        to: recipient.email,
        subject: safeSubject,
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
