import Stripe from 'npm:stripe@13.6.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function buildContractHtml(profile: any, acceptedAt: string, amount: number): string {
  const date = new Date(acceptedAt).toLocaleDateString('fr-FR')
  const firstName = escapeHtml(profile.first_name || '')
  const lastName = escapeHtml(profile.last_name || '')
  const email = escapeHtml(profile.email || '')
  const birthDate = profile.birth_date
    ? new Date(profile.birth_date).toLocaleDateString('fr-FR')
    : '—'
  const address = [
    profile.address,
    profile.address_complement,
    [profile.postal_code, profile.city].filter(Boolean).join(' ')
  ].filter(Boolean).map(escapeHtml).join(', ') || '—'
  const priceStr = amount ? `${(amount / 100).toFixed(2).replace('.', ',')} €` : '[PRIX À COMPLÉTER]'

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; font-size: 13px; color: #111; max-width: 700px; margin: 0 auto; padding: 32px 24px; }
  h1 { font-size: 16px; text-align: center; text-transform: uppercase; margin-bottom: 24px; }
  h2 { font-size: 13px; margin-top: 20px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  td { padding: 4px 0; }
  td:first-child { font-weight: bold; width: 220px; }
  .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
  .sig { margin-top: 40px; display: flex; justify-content: space-between; }
  .sig div { width: 45%; }
  .sig p { margin: 0 0 40px; font-weight: bold; }
  .sig .line { border-top: 1px solid #333; }
</style></head>
<body>
<h1>Contrat de Formation à l'Unité – Code de la Route en Ligne</h1>

<h2>Entre les soussignés :</h2>
<table>
  <tr><td>Auto-école :</td><td>BHS Permis</td></tr>
  <tr><td>Adresse :</td><td>58 chemin de la justice, 92290 Châtenay-Malabry, France</td></tr>
  <tr><td>SIRET :</td><td>93200579600010</td></tr>
  <tr><td>Représentée par :</td><td>Le responsable de BHS Permis</td></tr>
</table>

<h2>Et l'élève :</h2>
<table>
  <tr><td>Nom :</td><td>${lastName}</td></tr>
  <tr><td>Prénom :</td><td>${firstName}</td></tr>
  <tr><td>Date de naissance :</td><td>${birthDate}</td></tr>
  <tr><td>Adresse :</td><td>${address}</td></tr>
  <tr><td>Email :</td><td>${email}</td></tr>
</table>

<h2>Article 1 – Objet de la formation</h2>
<p>La présente formation concerne un module de code de la route en ligne, comprenant :</p>
<ul>
  <li>Supports pédagogiques (slides, vidéos, exercices)</li>
  <li>Accès en ligne via la plateforme Code ou Galère</li>
  <li>Correction et suivi pédagogique par l'Auto-école</li>
</ul>
<p>L'accès est fourni uniquement à l'élève inscrit, via son compte personnel.</p>

<h2>Article 2 – Durée et modalités</h2>
<ul>
  <li>Durée d'accès : À vie à compter de la date d'inscription.</li>
  <li>L'accès est personnel et non transférable.</li>
  <li>La formation est disponible en ligne 24h/24 et 7j/7.</li>
</ul>

<h2>Article 3 – Conditions financières</h2>
<ul>
  <li>Prix du module : <strong>${priceStr} TTC</strong></li>
  <li>Modalités de paiement : Paiement en ligne par carte bancaire via Stripe.</li>
  <li>Paiement unique, sans abonnement.</li>
</ul>

<h2>Article 4 – Renonciation au droit de rétractation</h2>
<p>Conformément à l'article L.221-28 du Code de la consommation, l'élève reconnaît expressément que la prestation de formation commencera immédiatement après la validation du paiement et que l'accès à la plateforme sera ouvert sans délai. En conséquence, <strong>l'élève renonce expressément à son droit de rétractation de 14 jours</strong> prévu par l'article L.221-18 du Code de la consommation.</p>

<h2>Article 5 – Obligations de l'élève</h2>
<p>L'élève s'engage à :</p>
<ol>
  <li>Utiliser les supports strictement pour son apprentissage personnel.</li>
  <li>Ne pas reproduire, partager ou diffuser les contenus à des tiers.</li>
  <li>Respecter les conditions générales d'utilisation de la plateforme.</li>
</ol>

<h2>Article 6 – Propriété intellectuelle</h2>
<p>Les supports pédagogiques sont la propriété de BHS Permis. Toute reproduction ou diffusion est strictement interdite.</p>

<h2>Article 7 – Responsabilité</h2>
<p>L'Auto-école ne peut être tenue responsable des problèmes techniques liés à l'accès Internet de l'élève. L'élève est responsable du bon usage de ses identifiants d'accès.</p>

<h2>Article 8 – Acceptation électronique</h2>
<p>L'élève a accepté ce contrat électroniquement le <strong>${date}</strong>, conformément à la loi n°2000-230 du 13 mars 2000 sur la signature électronique. Cette acceptation vaut signature et engagement contractuel.</p>

<div class="footer">
  <p>Fait à Châtenay-Malabry, le ${date}</p>
  <div class="sig">
    <div>
      <p>Signature de l'Auto-école :</p>
      <div class="line"></div>
      <p style="margin-top:4px;font-size:12px">BHS Permis</p>
    </div>
    <div>
      <p>Signature de l'Élève :</p>
      <div class="line"></div>
      <p style="margin-top:4px;font-size:12px">${firstName} ${lastName}<br><em style="font-size:11px;color:#555">Accepté électroniquement le ${date}</em></p>
    </div>
  </div>
</div>
</body>
</html>`
}

async function sendContractEmail(profile: any, acceptedAt: string, amount: number) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey || !profile.email) return

  const contractHtml = buildContractHtml(profile, acceptedAt, amount)
  const firstName = profile.first_name || ''

  const emailHtml = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
      <div style="margin-bottom:24px">
        <span style="font-weight:700;font-size:18px">Code ou Galère</span>
      </div>
      <h2 style="font-size:20px;margin:0 0 12px">Votre contrat de formation</h2>
      ${firstName ? `<p style="margin:0 0 16px;color:#555">Bonjour ${escapeHtml(firstName)},</p>` : ''}
      <p style="margin:0 0 16px">Merci pour votre inscription à <strong>Code ou Galère</strong>. Votre paiement a bien été validé et votre accès est maintenant actif.</p>
      <p style="margin:0 0 16px">Vous trouverez ci-dessous votre contrat de formation. Conservez cet email comme preuve de votre inscription.</p>
      <div style="margin:24px 0;padding:16px;background:#f8f8f8;border-left:4px solid #f5c518;border-radius:4px">
        <p style="margin:0;font-size:13px;color:#555">Accédez à votre espace de formation :<br>
        <a href="https://codeougalere.fr/dashboard" style="color:#111;font-weight:bold">codeougalere.fr/dashboard →</a></p>
      </div>
      <hr style="margin:32px 0;border:none;border-top:1px solid #eee">
      <div style="font-size:11px;color:#999">
        <p style="margin:0 0 4px">BHS Permis — 58 chemin de la justice, 92290 Châtenay-Malabry</p>
        <p style="margin:0">SIRET : 93200579600010 — permisougalere@gmail.com</p>
      </div>
    </div>
    <hr style="margin:0;border:none;border-top:1px solid #eee">
    <div style="padding:24px;background:#fafafa">
      <p style="font-size:11px;color:#999;text-align:center;margin:0 0 16px">— Contrat de formation —</p>
      ${contractHtml}
    </div>
  `

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Code ou Galère <noreply@codeougalere.fr>',
      to: profile.email,
      subject: 'Votre contrat de formation – Code ou Galère',
      html: emailHtml,
    }),
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId, userId } = await req.json()

    // Valider le format du sessionId Stripe (protection contre les appels arbitraires)
    if (!sessionId || !sessionId.startsWith('cs_') || !userId) {
      return new Response(JSON.stringify({ success: false, error: 'Paramètres invalides' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ success: false, message: 'Paiement non confirmé' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Vérifier que la session appartient bien à l'utilisateur authentifié
    const { data: purchase } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .eq('user_id', userId)
      .single()

    if (purchase && purchase.status !== 'paid') {
      await supabaseAdmin
        .from('purchases')
        .update({ status: 'paid', stripe_payment_intent_id: session.payment_intent as string })
        .eq('stripe_session_id', sessionId)

      await supabaseAdmin
        .from('profiles')
        .update({ has_access: true })
        .eq('id', userId)

      // Récupérer le profil complet pour l'email du contrat
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // Récupérer l'email depuis auth.users
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
      const profileWithEmail = { ...profile, email: authUser?.user?.email }

      const acceptedAt = profile?.contract_accepted_at || new Date().toISOString()

      // Envoyer le contrat par email — awaité pour s'assurer que Deno n'arrête pas l'exécution avant l'envoi
      try {
        await sendContractEmail(profileWithEmail, acceptedAt, purchase.amount)
      } catch (emailErr) {
        console.error('Erreur envoi contrat email:', emailErr)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
