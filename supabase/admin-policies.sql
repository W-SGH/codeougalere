-- Fonction non-récursive pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Policies admin pour profiles
DROP POLICY IF EXISTS "Admins peuvent tout voir" ON public.profiles;
CREATE POLICY "Admins peuvent tout voir"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Policies admin pour purchases
DROP POLICY IF EXISTS "Admins peuvent voir tous les achats" ON public.purchases;
CREATE POLICY "Admins peuvent voir tous les achats"
  ON public.purchases FOR ALL
  USING (public.is_admin());

-- Policies admin pour user_progress
DROP POLICY IF EXISTS "Admins peuvent voir toute la progression" ON public.user_progress;
CREATE POLICY "Admins peuvent voir toute la progression"
  ON public.user_progress FOR ALL
  USING (public.is_admin());
