import Stripe from 'npm:stripe@13.6.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

async function sendPaymentConfirmationEmail(email: string, firstName: string) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Code ou Galère <noreply@codeougalere.fr>',
      to: email,
      subject: '✅ Votre accès est activé — Code ou Galère',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #FFD700; font-size: 28px; margin-bottom: 8px;">Bienvenue ${firstName} ! 🎉</h1>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Votre paiement de <strong>49€</strong> a bien été reçu et votre accès est maintenant <strong>activé</strong>.
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Vous avez désormais accès à :
          </p>
          <ul style="color: #333; font-size: 15px; line-height: 2;">
            <li>✅ 7 thèmes complets du code de la route</li>
            <li>✅ 14 vidéos HD commentées par un expert</li>
            <li>✅ 70+ questions d'entraînement avec corrections</li>
          </ul>
          <a href="https://codeougalere.fr/dashboard"
             style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #FFD700; color: #000; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 16px;">
            Accéder à mes cours →
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 32px;">
            Votre reçu Stripe vous a été envoyé séparément. En cas de problème, répondez à cet email.
          </p>
        </div>
      `,
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

      // 3. Envoyer l'email de confirmation
      const email = session.customer_email
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .single()

      if (email) {
        await sendPaymentConfirmationEmail(email, profile?.first_name || 'là')
        console.log(`📧 Email de confirmation envoyé à ${email}`)
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
