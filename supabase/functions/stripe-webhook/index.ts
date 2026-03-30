import Stripe from 'npm:stripe@13.6.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}


function buildContractHtml(profile: any, email: string, acceptedAt: string, amount: number): string {
  const date = new Date(acceptedAt).toLocaleDateString('fr-FR')
  const firstName = escapeHtml(profile?.first_name || '')
  const lastName = escapeHtml(profile?.last_name || '')
  const safeEmail = escapeHtml(email || '')
  const birthDate = profile?.birth_date
    ? new Date(profile.birth_date).toLocaleDateString('fr-FR')
    : '—'
  const address = [
    profile?.address,
    profile?.address_complement,
    [profile?.postal_code, profile?.city].filter(Boolean).join(' ')
  ].filter(Boolean).map(escapeHtml).join(', ') || '—'
  const priceStr = amount ? `${(amount / 100).toFixed(2).replace('.', ',')} €` : '[PRIX À COMPLÉTER]'

  return `<!DOCTYPE html>
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
  <tr><td>Email :</td><td>${safeEmail}</td></tr>
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
  <li>Modalité : Carte bancaire via Stripe (sécurisé SSL). Paiement unique.</li>
</ul>

<h2>Article 4 – Renonciation au droit de rétractation</h2>
<p>Conformément à l'article L.221-28 du Code de la consommation, l'élève reconnaît expressément que la prestation de formation commencera immédiatement après la validation du paiement et que l'accès à la plateforme sera ouvert sans délai. En conséquence, <strong>l'élève renonce expressément à son droit de rétractation de 14 jours</strong> prévu par l'article L.221-18 du Code de la consommation.</p>

<h2>Article 5 – Obligations de l'élève</h2>
<ol>
  <li>Utiliser les contenus strictement pour son apprentissage personnel.</li>
  <li>Ne pas reproduire, partager ou diffuser les contenus à des tiers.</li>
  <li>Respecter les conditions générales d'utilisation de la plateforme.</li>
</ol>

<h2>Article 6 – Propriété intellectuelle</h2>
<p>Les contenus pédagogiques sont la propriété exclusive de BHS Permis. Toute reproduction ou diffusion non autorisée est strictement interdite.</p>

<h2>Article 7 – Responsabilité</h2>
<p>BHS Permis ne peut être tenu responsable des problèmes techniques liés à la connexion Internet de l'élève. L'élève est responsable du bon usage de ses identifiants d'accès.</p>

<h2>Article 8 – Acceptation électronique</h2>
<p>L'élève a accepté ce contrat électroniquement le <strong>${date}</strong>, conformément à la loi n°2000-230 du 13 mars 2000 sur la signature électronique.</p>

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
      <p style="margin-top:4px;font-size:12px">${firstName} ${lastName}<br>
      <em style="font-size:11px;color:#555">Accepté électroniquement le ${date}</em></p>
    </div>
  </div>
</div>
</body></html>`
}

async function sendConfirmationWithContract(email: string, profile: any, amount: number) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey || !email) return

  const firstName = escapeHtml(profile?.first_name || '')
  const acceptedAt = profile?.contract_accepted_at || new Date().toISOString()
  const contractHtml = buildContractHtml(profile, email, acceptedAt, amount)

  const emailHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111">
      <h1 style="color:#FFD700;font-size:28px;margin-bottom:8px">Bienvenue ${firstName} ! 🎉</h1>
      <p style="font-size:16px;line-height:1.6">
        Votre paiement de <strong>49€</strong> a bien été reçu et votre accès est maintenant <strong>activé</strong>.
      </p>
      <p style="font-size:16px;line-height:1.6">Vous avez désormais accès à :</p>
      <ul style="font-size:15px;line-height:2">
        <li>✅ 7 thèmes complets du code de la route</li>
        <li>✅ 14 vidéos HD commentées par un expert</li>
        <li>✅ 70+ questions d'entraînement avec corrections</li>
      </ul>
      <a href="https://codeougalere.fr/dashboard"
         style="display:inline-block;margin-top:24px;padding:14px 32px;background:#FFD700;color:#000;font-weight:bold;text-decoration:none;border-radius:8px;font-size:16px">
        Accéder à mes cours →
      </a>
      <hr style="margin:40px 0;border:none;border-top:1px solid #eee">
      <p style="font-size:13px;color:#555;margin-bottom:8px">
        <strong>Votre contrat de formation</strong> est disponible ci-dessous.
        Conservez cet email comme preuve de votre inscription (L.221-14 Code de la consommation).
      </p>
      <div style="font-size:11px;color:#999;margin-bottom:32px">
        <p style="margin:0 0 4px">BHS Permis — 58 chemin de la justice, 92290 Châtenay-Malabry</p>
        <p style="margin:0">SIRET : 93200579600010 — permisougalere@gmail.com</p>
      </div>
    </div>
    <div style="background:#fafafa;padding:24px;border-top:1px solid #eee">
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
      to: email,
      subject: '✅ Votre accès est activé + votre contrat de formation — Code ou Galère',
      html: emailHtml,
    }),
  })
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret, undefined, Stripe.createSubtleCryptoProvider())
  } catch (err) {
    console.error('Erreur signature webhook:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status === 'paid') {
      const userId = session.metadata?.user_id

      if (!userId) {
        console.error('user_id manquant dans les metadata')
        return new Response('user_id manquant', { status: 400 })
      }

      // 1. Marquer le paiement comme validé
      await supabaseAdmin
        .from('purchases')
        .update({
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id)

      // 2. Donner l'accès à l'utilisateur
      await supabaseAdmin
        .from('profiles')
        .update({ has_access: true, updated_at: new Date().toISOString() })
        .eq('id', userId)

      console.log(`✅ Accès accordé à l'utilisateur ${userId}`)

      // 3. Récupérer email + profil complet
      const email = session.customer_email
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // 4. Email unique : confirmation de paiement + contrat de formation
      if (email) {
        const { data: purchase } = await supabaseAdmin
          .from('purchases')
          .select('amount')
          .eq('stripe_session_id', session.id)
          .single()

        await sendConfirmationWithContract(email, profile, purchase?.amount || session.amount_total || 0)
        console.log(`📧 Email de confirmation + contrat envoyé à ${email}`)
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    await supabaseAdmin
      .from('purchases')
      .update({ status: 'failed' })
      .eq('stripe_session_id', session.id)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
