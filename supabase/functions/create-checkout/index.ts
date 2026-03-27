import Stripe from 'npm:stripe@13.6.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting : max 10 sessions de paiement par userId sur 60 minutes
async function checkRateLimit(supabaseAdmin: any, userId: string): Promise<boolean> {
  const key = `checkout:${userId}`
  const windowMs = 60 * 60 * 1000 // 1h
  const maxRequests = 10

  const { data } = await supabaseAdmin
    .from('rate_limits')
    .select('count, window_start')
    .eq('key', key)
    .single()

  const now = new Date()

  if (!data || (now.getTime() - new Date(data.window_start).getTime()) > windowMs) {
    await supabaseAdmin.from('rate_limits').upsert({ key, count: 1, window_start: now.toISOString() })
    return true
  }

  if (data.count >= maxRequests) return false

  await supabaseAdmin.from('rate_limits').update({ count: data.count + 1 }).eq('key', key)
  return true
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, email, productName, amount, successUrl, cancelUrl, promoCode } = await req.json()

    if (!userId || !email) {
      throw new Error('userId et email sont requis')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Rate limiting par userId
    const allowed = await checkRateLimit(supabaseAdmin, userId)
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Trop de tentatives. Réessayez dans une heure.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let finalAmount = amount || 4900
    let promoData: any = null

    if (promoCode) {
      const { data: promo } = await supabaseAdmin
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('active', true)
        .single()

      if (promo) {
        const notExpired = !promo.expires_at || new Date(promo.expires_at) > new Date()
        const hasUsesLeft = !promo.max_uses || promo.used_count < promo.max_uses

        if (notExpired && hasUsesLeft) {
          finalAmount = Math.round(finalAmount * (1 - promo.discount_percent / 100))
          promoData = promo
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: productName || 'Pack Vidéo Intégral - Code de la Route',
              description: '7 thèmes complets, 14 vidéos HD, 70+ questions d\'entraînement',
              images: ['https://votre-site.com/preview.jpg'],
            },
            unit_amount: finalAmount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        supabase_url: Deno.env.get('SUPABASE_URL')!,
      },
    })

    await supabaseAdmin.from('purchases').insert({
      user_id: userId,
      stripe_session_id: session.id,
      amount: finalAmount,
      status: 'pending',
    })

    if (promoData) {
      const { error: promoUpdateError } = await supabaseAdmin.rpc('increment_promo_used_count', { promo_id: promoData.id })
      if (promoUpdateError) console.error('Promo increment error:', promoUpdateError)
    }

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
