-- Table de préinscriptions pour la campagne de lancement
CREATE TABLE IF NOT EXISTS public.preregistrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_early_bird BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pas d'accès public direct (tout passe par l'edge function avec service role)
ALTER TABLE public.preregistrations ENABLE ROW LEVEL SECURITY;

-- Table promo_codes si elle n'existe pas encore
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT TRUE,
  discount_percent INTEGER NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fonction pour incrémenter le compteur d'utilisation (si pas déjà créée)
CREATE OR REPLACE FUNCTION public.increment_promo_used_count(promo_id UUID)
RETURNS VOID AS $$
  UPDATE public.promo_codes SET used_count = used_count + 1 WHERE id = promo_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Code promo early bird : 30% de réduction, 50 utilisations max
INSERT INTO public.promo_codes (code, active, discount_percent, max_uses)
VALUES ('LANCEMENT', true, 30, 50)
ON CONFLICT (code) DO NOTHING;

-- Table de rate limiting pour les edge functions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);
