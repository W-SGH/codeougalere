import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REMINDERS = [
  { type: 'reminder_1', days: 1 },
  { type: 'reminder_3', days: 3 },
  { type: 'reminder_7', days: 7 },
]

function getEmailContent(type: string, firstName: string): { subject: string; html: string } {
  const name = firstName || 'toi'
  const ctaUrl = 'https://codeougalere.fr/tarifs'

  if (type === 'reminder_1') {
    return {
      subject: 'Tu n\'as pas terminé ton inscription 👀',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
          <h2 style="margin:0 0 16px">Hey ${name} 👋</h2>
          <p style="margin:0 0 16px;line-height:1.6">Tu t'es inscrit sur <strong>Code ou Galère</strong> hier mais tu n'as pas encore accès aux vidéos.</p>
          <p style="margin:0 0 24px;line-height:1.6">7 thèmes complets, 14 vidéos HD et 70+ questions t'attendent pour réussir ton code du premier coup.</p>
          <a href="${ctaUrl}" style="display:inline-block;background:#f5c400;color:#111;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:16px">
            Accéder aux vidéos — 49€
          </a>
          <p style="margin:24px 0 0;font-size:13px;color:#666">Satisfait ou remboursé 30 jours.</p>
        </div>
      `,
    }
  }

  if (type === 'reminder_3') {
    return {
      subject: 'Le code de la route, ça se prépare 📚',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
          <h2 style="margin:0 0 16px">Salut ${name},</h2>
          <p style="margin:0 0 16px;line-height:1.6">Beaucoup de gens ratent le code parce qu'ils le préparent mal — trop de par cœur, pas assez de méthode.</p>
          <p style="margin:0 0 16px;line-height:1.6"><strong>Code ou Galère</strong> c'est une approche différente : des vidéos courtes qui expliquent vraiment la logique derrière chaque règle.</p>
          <a href="${ctaUrl}" style="display:inline-block;background:#f5c400;color:#111;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:16px">
            Voir le programme — 49€
          </a>
          <p style="margin:24px 0 0;font-size:13px;color:#666">Satisfait ou remboursé 30 jours.</p>
        </div>
      `,
    }
  }

  // reminder_7
  return {
    subject: 'Dernière chance — offre limitée 🎯',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="margin:0 0 16px">Salut ${name},</h2>
        <p style="margin:0 0 16px;line-height:1.6">Ça fait une semaine que tu es inscrit et tu n'as toujours pas démarré ta préparation.</p>
        <p style="margin:0 0 16px;line-height:1.6">On ne veut pas te spammer — c'est le dernier email qu'on t'envoie.</p>
        <p style="margin:0 0 24px;line-height:1.6">Si tu changes d'avis, les vidéos sont là quand tu veux. <strong>Paiement unique, accès à vie.</strong></p>
        <a href="${ctaUrl}" style="display:inline-block;background:#f5c400;color:#111;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:16px">
          Commencer maintenant — 49€
        </a>
        <p style="margin:24px 0 0;font-size:13px;color:#666">Satisfait ou remboursé 30 jours.</p>
      </div>
    `,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const resendKey = Deno.env.get('RESEND_API_KEY')!
  let sent = 0
  let errors = 0

  for (const reminder of REMINDERS) {
    const dayStart = new Date()
    dayStart.setDate(dayStart.getDate() - reminder.days)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    // Utilisateurs inscrits ce jour-là, sans accès, avec un email
    const { data: users } = await supabase
      .from('profiles')
      .select('id, first_name, email')
      .eq('has_access', false)
      .not('email', 'is', null)
      .gte('created_at', dayStart.toISOString())
      .lte('created_at', dayEnd.toISOString())

    if (!users?.length) continue

    // Filtrer ceux qui ont déjà reçu cet email
    const { data: alreadySent } = await supabase
      .from('email_logs')
      .select('user_id')
      .eq('email_type', reminder.type)
      .in('user_id', users.map(u => u.id))

    const alreadySentIds = new Set((alreadySent || []).map(r => r.user_id))
    const toSend = users.filter(u => !alreadySentIds.has(u.id))

    for (const user of toSend) {
      const { subject, html } = getEmailContent(reminder.type, user.first_name)

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Code ou Galère <noreply@codeougalere.fr>',
          to: user.email,
          subject,
          html,
        }),
      })

      if (res.ok) {
        await supabase.from('email_logs').insert({
          user_id: user.id,
          email_type: reminder.type,
        })
        sent++
      } else {
        const err = await res.json()
        console.error(`Failed to send ${reminder.type} to ${user.email}:`, err)
        errors++
      }
    }
  }

  return new Response(
    JSON.stringify({ sent, errors }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
