-- ====================================================
-- Schéma base de données Auto-École
-- À exécuter dans l'éditeur SQL de Supabase
-- ====================================================

-- 1. Table des profils utilisateurs (extension de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  has_access BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des achats
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER DEFAULT 4900, -- en centimes
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table de progression des cours
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER, -- pour les quiz (nombre de bonnes réponses)
  watched_seconds INTEGER DEFAULT 0, -- pour les vidéos
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ====================================================
-- Sécurité Row Level Security (RLS)
-- ====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Utilisateurs peuvent voir leur propre profil"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Utilisateurs peuvent modifier leur propre profil"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins peuvent tout voir"
  ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Policies pour purchases
CREATE POLICY "Utilisateurs peuvent voir leurs achats"
  ON public.purchases FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins peuvent voir tous les achats"
  ON public.purchases FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Policies pour user_progress
CREATE POLICY "Utilisateurs peuvent voir leur progression"
  ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leur progression"
  ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent mettre à jour leur progression"
  ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins peuvent voir toute la progression"
  ON public.user_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ====================================================
-- Trigger : créer automatiquement un profil à l'inscription
-- ====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- Trigger : mettre à jour updated_at automatiquement
-- ====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ====================================================
-- Table : logs des emails envoyés (séquence automatique)
-- ====================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'reminder_1', 'reminder_3', 'reminder_7'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email_type)
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
-- Accessible uniquement via service role (Edge Functions)

-- ====================================================
-- Cron : appel quotidien de la séquence email (à exécuter après avoir
-- activé les extensions pg_cron et pg_net dans Dashboard > Database > Extensions)
-- Remplacez YOUR_PROJECT_REF et YOUR_SERVICE_ROLE_KEY
-- ====================================================

-- SELECT cron.schedule(
--   'send-reminder-emails',
--   '0 8 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminder-emails',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
--     ),
--     body := '{}'::jsonb
--   )
--   $$
-- );

-- ====================================================
-- Créer votre compte admin (remplacez YOUR_USER_ID par votre UUID Supabase)
-- ====================================================
-- UPDATE public.profiles SET is_admin = TRUE WHERE id = 'YOUR_USER_ID';
