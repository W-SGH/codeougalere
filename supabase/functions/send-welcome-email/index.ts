import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })

  // Get user from JWT
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user?.email) return new Response('Unauthorized', { status: 401 })

  // Get first_name from profile
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('first_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.first_name || ''
  const email = user.email

  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return new Response(JSON.stringify({ ok: false }), { status: 200 })

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Code ou Galère <noreply@codeougalere.fr>',
      to: email,
      subject: '👋 Bienvenue sur Code ou Galère !',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #FFD700; font-size: 28px; margin-bottom: 8px;">
            Bienvenue ${firstName ? firstName + ' !' : 'sur Code ou Galère !'}
          </h1>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Votre compte a bien été créé. Vous êtes à deux pas de réussir votre code de la route.
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Notre formation complète comprend :
          </p>
          <ul style="color: #333; font-size: 15px; line-height: 2;">
            <li>✅ 7 thèmes complets du code de la route</li>
            <li>✅ 14 vidéos HD commentées par un expert</li>
            <li>✅ 70+ questions d'entraînement avec corrections</li>
          </ul>
          <a href="https://codeougalere.fr/tarifs"
             style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #FFD700; color: #000; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 16px;">
            Démarrer ma formation →
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 32px;">
            En cas de problème, répondez à cet email.
          </p>
        </div>
      `,
    }),
  })

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
