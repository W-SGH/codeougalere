import Stripe from 'npm:stripe@13.6.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
