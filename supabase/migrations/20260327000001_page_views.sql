-- Table de suivi des visites de pages
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  session_id TEXT,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut insérer une vue (visiteurs anonymes inclus)
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Seuls les utilisateurs connectés peuvent lire (vérification admin côté app)
CREATE POLICY "Authenticated users can read page views" ON public.page_views
  FOR SELECT TO authenticated USING (true);
