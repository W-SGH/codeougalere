import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EARLY_BIRD_LIMIT = 50
const PROMO_CODE = 'LANCEMENT'
const SITE_URL = 'https://codeougalere.fr'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function earlyBirdEmail(email: string) {
  return {
    from: 'Code ou Galère <noreply@codeougalere.fr>',
    to: email,
    subject: '🎉 Votre code promo -30% — Code ou Galère',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f172a; color: #fff;">
        <h1 style="color: #FFD700; font-size: 26px; margin-bottom: 8px;">Félicitations !</h1>
        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">
          Vous faites partie des <strong style="color: #fff;">50 premiers inscrits</strong> sur Code ou Galère.
          Voici votre avantage exclusif :
        </p>

        <div style="background: #1e293b; border: 2px solid #FFD700; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px;">Votre code promo</p>
          <p style="color: #FFD700; font-size: 36px; font-weight: 900; letter-spacing: 4px; margin: 0;">${PROMO_CODE}</p>
          <p style="color: #fff; font-size: 18px; font-weight: bold; margin: 8px 0 0;">−30% sur la formation complète</p>
        </div>

        <a href="${SITE_URL}/tarifs?promo=${PROMO_CODE}"
           style="display: block; text-align: center; padding: 16px 32px; background: #FFD700; color: #000; font-weight: bold; text-decoration: none; border-radius: 10px; font-size: 16px; margin-bottom: 32px;">
          Démarrer ma formation →
        </a>

        <ul style="color: #94a3b8; font-size: 14px; line-height: 2; padding-left: 20px;">
          <li>7 thèmes complets du code de la route</li>
          <li>14 vidéos HD commentées par un expert</li>
          <li>70+ questions d'entraînement avec corrections</li>
          <li>Accès à vie, sans abonnement</li>
        </ul>

        <p style="color: #64748b; font-size: 12px; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px;">
          Code valable dans la limite des 50 premières utilisations.<br>
          En cas de problème, répondez à cet email.
        </p>
      </div>
    `,
  }
}

function waitlistEmail(email: string) {
  return {
    from: 'Code ou Galère <noreply@codeougalere.fr>',
    to: email,
    subject: '✅ Inscription confirmée — Code ou Galère',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f172a; color: #fff;">
        <h1 style="color: #FFD700; font-size: 26px; margin-bottom: 8px;">C'est noté !</h1>
        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">
          Votre email est bien enregistré. Nous vous enverrons un message dès l'ouverture officielle de la plateforme.
        </p>
        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">
          En attendant, voici ce qui vous attend :
        </p>
        <ul style="color: #94a3b8; font-size: 14px; line-height: 2; padding-left: 20px;">
          <li>7 thèmes complets du code de la route</li>
          <li>14 vidéos HD commentées par un expert</li>
          <li>70+ questions d'entraînement avec corrections</li>
          <li>Accès à vie, sans abonnement</li>
        </ul>
        <a href="${SITE_URL}"
           style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: #FFD700; color: #000; font-weight: bold; text-decoration: none; border-radius: 10px; font-size: 15px;">
          Découvrir la formation →
        </a>
        <p style="color: #64748b; font-size: 12px; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px;">
          En cas de problème, répondez à cet email.
        </p>
      </div>
    `,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // GET: nombre de places restantes
  if (req.method === 'GET') {
    const { count } = await supabaseAdmin
      .from('preregistrations')
      .select('*', { count: 'exact', head: true })
    const spotsLeft = Math.max(0, EARLY_BIRD_LIMIT - (count ?? 0))
    return new Response(
      JSON.stringify({ total: count ?? 0, spotsLeft }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // POST: inscription
  if (req.method === 'POST') {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Déjà inscrit ?
    const { data: existing } = await supabaseAdmin
      .from('preregistrations')
      .select('is_early_bird')
      .eq('email', normalizedEmail)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, alreadyRegistered: true, isEarlyBird: existing.is_early_bird }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Compter les inscrits actuels pour savoir si early bird
    const { count } = await supabaseAdmin
      .from('preregistrations')
      .select('*', { count: 'exact', head: true })

    const isEarlyBird = (count ?? 0) < EARLY_BIRD_LIMIT

    // Insérer
    const { error: insertError } = await supabaseAdmin
      .from('preregistrations')
      .insert({ email: normalizedEmail, is_early_bird: isEarlyBird })

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'inscription" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Envoyer l'email
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (resendKey) {
      const emailPayload = isEarlyBird ? earlyBirdEmail(normalizedEmail) : waitlistEmail(normalizedEmail)
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      })
    }

    return new Response(
      JSON.stringify({ success: true, isEarlyBird }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
})
